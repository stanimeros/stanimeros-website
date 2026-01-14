import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2, Paperclip, X, Trash2, User, Bot } from "lucide-react"
import { analyzeFileWithGemini } from "@/lib/gemini"
import Header from "@/components/Header"
import ParticlesBackground from "@/components/ParticlesBackground"
import DialogflowMessenger, { type DialogflowMessengerRef } from "@/components/DialogflowMessenger"

interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
  fileName?: string
}

const CUSTOM_MESSAGES_KEY = "custom-chat-messages"

const SUGGESTED_QUESTIONS = [
  "Τι είναι το DNA και πώς λειτουργεί;",
  "Πώς γίνεται η φωτοσύνθεση;",
  "Εξήγησε τη διαδικασία της κυτταρικής αναπαραγωγής",
  "Τι είναι τα ενζύμια και ποιος ο ρόλος τους;",
  "Πώς λειτουργεί το ανοσοποιητικό σύστημα;",
  "Εξήγησε τη διαφορά μεταξύ μίτωσης και μείωσης",
]

export default function CustomChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false)
  const [analyzingFileName, setAnalyzingFileName] = useState<string | null>(null)
  const [analyzingFileType, setAnalyzingFileType] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dialogflowMessengerRef = useRef<DialogflowMessengerRef>(null)
  const isInitializedRef = useRef(false)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Restore messages from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(CUSTOM_MESSAGES_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          const restoredMessages: Message[] = parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
          setMessages(restoredMessages)
        }
      }
    } catch (error) {
      console.error("[CustomChat] Error loading messages from sessionStorage:", error)
    }
    isInitializedRef.current = true
  }, [])

  // Save messages to sessionStorage whenever messages change (but skip initial mount)
  useEffect(() => {
    if (!isInitializedRef.current) return
    
    try {
      const serialized = JSON.stringify(messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      })))
      sessionStorage.setItem(CUSTOM_MESSAGES_KEY, serialized)
    } catch (error) {
      console.error("[CustomChat] Error saving messages to sessionStorage:", error)
    }
  }, [messages])

  // Track sent messages to avoid duplicates
  const sentMessagesRef = useRef<Set<string>>(new Set())

  const addMessage = useCallback((text: string, isBot: boolean, fileName?: string) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text,
      isBot,
      timestamp: new Date(),
      fileName,
    }
    setMessages((prev) => [...prev, newMessage])
  }, [])

  // Listen to Dialogflow events
  useEffect(() => {
    const handleResponseReceived = (event: Event) => {
      console.log("[CustomChat:events] df-response-received event triggered")
      const customEvent = event as CustomEvent<{ messages: Array<{ type: string; text: string }> }>
      const responseMessages = customEvent.detail?.messages || []
      console.log(`[CustomChat:events] Received ${responseMessages.length} response messages`)

      responseMessages.forEach((msg) => {
        if (msg.type === "text" && msg.text) {
          addMessage(msg.text, true)
        }
      })

      setIsLoading(false)
    }

    const handleUserInputEntered = (event: Event) => {
      console.log("[CustomChat:events] df-user-input-entered event triggered")
      const customEvent = event as CustomEvent<{ input: string; file?: File }>
      const input = customEvent.detail?.input

      if (input && !customEvent.detail?.file) {
        // Only add if we haven't already added this message
        // (handleSend/handleSuggestedQuestion add it before sending)
        if (!sentMessagesRef.current.has(input)) {
          console.log("[CustomChat:events] Adding user input message (not already sent)")
          addMessage(input, false)
          sentMessagesRef.current.add(input)
        } else {
          console.log("[CustomChat:events] User input already sent, skipping")
        }
        setIsLoading(true)
      }
    }

    window.addEventListener("df-response-received", handleResponseReceived)
    window.addEventListener("df-user-input-entered", handleUserInputEntered)

    return () => {
      window.removeEventListener("df-response-received", handleResponseReceived)
      window.removeEventListener("df-user-input-entered", handleUserInputEntered)
    }
  }, [addMessage])

  const sendMessageToDialogflow = (text: string): boolean => {
    try {
      const dfMessenger = document.querySelector('df-messenger') as any
      if (dfMessenger && typeof dfMessenger.sendQuery === 'function') {
        dfMessenger.sendQuery(text)
        console.log("[CustomChat:sendMessage] Sent message via sendQuery")
        return true
      } else {
        console.error("[CustomChat:sendMessage] df-messenger or sendQuery method not found")
        return false
      }
    } catch (error) {
      console.error("[CustomChat:sendMessage] Error sending message:", error)
      return false
    }
  }

  const handleSend = async (overrideTextOrEvent?: string | React.MouseEvent<HTMLButtonElement>) => {
    // Handle both direct call with text and event handler call
    const textToUse = typeof overrideTextOrEvent === 'string' 
      ? overrideTextOrEvent 
      : inputText.trim()
       
    if (!textToUse && !selectedFile) return

    const text = textToUse
    const fileName = selectedFile?.name || undefined
    const fileToAnalyze = selectedFile
    
    // Clear file from input section immediately
    setSelectedFile(null)
    setInputText("")
    
    // Determine file type and display text
    const isImage = fileToAnalyze?.type.startsWith('image/')
    const isPDF = fileToAnalyze?.type === 'application/pdf'
    const isDOCX = fileToAnalyze?.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                   fileToAnalyze?.name.toLowerCase().endsWith('.docx')
    
    let fileTypeLabel = ''
    if (isImage) fileTypeLabel = 'Εικόνα'
    else if (isPDF) fileTypeLabel = 'PDF'
    else if (isDOCX) fileTypeLabel = 'DOCX'
    
    // Display only the input text in the chat (not the analysis)
    const displayText = text || (fileName ? `${fileTypeLabel}: ${fileName}` : "")
    
    // If there's a file, analyze it first for Dialogflow
    let finalText = text
    if (fileToAnalyze && fileName) {
      setIsAnalyzingImage(true)
      setAnalyzingFileName(fileName)
      setAnalyzingFileType(fileTypeLabel)
      try {
        const analysis = await analyzeFileWithGemini(fileToAnalyze)
        if (analysis.error) {
          // Show error message
          addMessage(`Σφάλμα ανάλυσης ${fileTypeLabel.toLowerCase()}: ${analysis.error}`, false, fileName)
          setIsAnalyzingImage(false)
          setAnalyzingFileName(null)
          setAnalyzingFileType(null)
          return
        }
        // Combine input text with Gemini analysis for Dialogflow
        if (text) {
          finalText = `${text}\n\n[Ανάλυση ${fileTypeLabel.toLowerCase()} "${fileName}"]:\n${analysis.text}`
        } else {
          finalText = `[Ανάλυση ${fileTypeLabel.toLowerCase()} "${fileName}"]:\n${analysis.text}`
        }
      } catch (error) {
        console.error(`Error analyzing ${fileTypeLabel.toLowerCase()}:`, error)
        addMessage(`Σφάλμα ανάλυσης ${fileTypeLabel.toLowerCase()}: ${error instanceof Error ? error.message : "Άγνωστο σφάλμα"}`, false, fileName)
        setIsAnalyzingImage(false)
        setAnalyzingFileName(null)
        setAnalyzingFileType(null)
        return
      } finally {
        setIsAnalyzingImage(false)
        setAnalyzingFileName(null)
        setAnalyzingFileType(null)
      }
    }
    
    // Add user message to UI (only input text + file name indicator)
    addMessage(displayText, false, fileName)
    sentMessagesRef.current.add(finalText)
    setIsLoading(true)

    // Send to Dialogflow (input text + image analysis)
    sendMessageToDialogflow(finalText)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check if it's a supported file type (image, PDF, or DOCX)
      const isImage = file.type.startsWith('image/')
      const isPDF = file.type === 'application/pdf'
      const isDOCX = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                     file.name.toLowerCase().endsWith('.docx')
      
      if (!isImage && !isPDF && !isDOCX) {
        alert('Παρακαλώ επιλέξτε ένα αρχείο εικόνας, PDF ή DOCX')
        return
      }
      setSelectedFile(file)
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClearChat = () => {
    setMessages([])
    sentMessagesRef.current.clear()
    
    // Clear custom messages from sessionStorage
    try {
      sessionStorage.removeItem(CUSTOM_MESSAGES_KEY)
    } catch (error) {
      console.error("[CustomChat] Error clearing custom messages from sessionStorage:", error)
    }
    
    // Reset Dialogflow session using startNewSession
    try {
      const dfMessenger = document.querySelector('df-messenger') as any
      if (dfMessenger && typeof dfMessenger.startNewSession === 'function') {
        dfMessenger.startNewSession({
          retainHistory: false,
          clearAuthentication: false
        })
        console.log("[CustomChat] Dialogflow session reset via startNewSession")
      }
    } catch (error) {
      console.error("[CustomChat] Error resetting Dialogflow session:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <ParticlesBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
      
      {/* Content */}
      <div className="relative z-10">
        <Header />
        
        {/* Fixed Input Area at bottom */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background z-50">
          <div className="max-w-[1000px] mx-auto p-4">
            <div className="flex flex-col gap-2">
              {/* Selected File Display */}
              {selectedFile && (
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              <div className="flex gap-2">
                {/* File Input (hidden) */}
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                
                {/* File Upload Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isAnalyzingImage}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>

                {/* Text Input */}
                <Input
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ρωτήστε κάτι..."
                  className="flex-1"
                  disabled={isAnalyzingImage}
                />

                {/* Send Button */}
                <Button
                  onClick={handleSend}
                  disabled={(!inputText.trim() && !selectedFile) || isLoading || isAnalyzingImage}
                  size="icon"
                >
                  {(isLoading || isAnalyzingImage) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <section className="pt-28 pb-32 max-w-[1000px] mx-auto px-4 w-full">
          {/* Agent Title Header */}
          <div className="border-b border-border p-4 bg-background/50 backdrop-blur-sm rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-foreground">Βοηθός της Νίκης</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Εξειδικευμένος βοηθός για ερωτήσεις βιολογίας. Ρωτήστε με για έννοιες, διαδικασίες και έννοιες της βιολογίας.
                </p>
              </div>
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearChat}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Καθαρισμός
                </Button>
              )}
            </div>
          </div>
          
          {/* Messages */}
          <div className="space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-6">Καλώς ήρθατε! Επιλέξτε μια ερώτηση ή ρωτήστε κάτι:</p>
            
            {/* Suggested Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
              {SUGGESTED_QUESTIONS.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left h-auto py-3 px-4 whitespace-normal justify-start"
                  onClick={() => handleSend(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 w-full ${message.isBot ? "justify-start" : "justify-end"}`}
          >
            {message.isBot ? (
              <>
                {/* Bot Avatar */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </div>
                
                {/* Bot Message Content */}
                <div className="flex flex-col items-start max-w-[70%]">
                  {/* Username */}
                  <div className="text-xs mb-1 px-1 text-muted-foreground">
                    Βοηθός
                  </div>
                  
                  {/* Message Bubble */}
                  <div className="rounded-lg rounded-tl-none p-3 bg-muted text-foreground">
                    {message.fileName && (
                      <div className="text-xs mb-2 pb-2 border-b border-muted-foreground/20">
                        📎 {message.fileName}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap break-words">{message.text}</div>
                    <div className="text-xs mt-2 text-muted-foreground">
                      {message.timestamp.toLocaleTimeString("el-GR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* User Message Content */}
                <div className="flex flex-col items-end max-w-[70%]">
                  {/* Username */}
                  <div className="text-xs mb-1 px-1 text-foreground">
                    Εσύ
                  </div>
                  
                  {/* Message Bubble */}
                  <div className="rounded-lg rounded-tr-none p-3 bg-primary text-primary-foreground">
                    {message.fileName && (
                      <div className="text-xs mb-2 pb-2 border-b border-primary-foreground/20">
                        📎 {message.fileName}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap break-words">{message.text}</div>
                    <div className="text-xs mt-2 text-primary-foreground/70">
                      {message.timestamp.toLocaleTimeString("el-GR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
                
                {/* User Avatar */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              </>
            )}
          </div>
        ))}

        {(isLoading || isAnalyzingImage) && (
          <div className="flex items-start gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Bot className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col items-start">
              <div className="text-xs mb-1 px-1 text-muted-foreground">Βοηθός</div>
              <div className="bg-muted rounded-lg rounded-tl-none p-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isAnalyzingImage && analyzingFileName ? (
                  <span className="text-sm text-muted-foreground">Ανάλυση {analyzingFileType?.toLowerCase() || 'αρχείου'}: {analyzingFileName}</span>
                ) : (
                  <span className="text-sm text-muted-foreground">Αναμονή απάντησης...</span>
                )}
              </div>
            </div>
          </div>
        )}

          <div ref={messagesEndRef} />
          </div>
        </section>
      </div>
      
      {/* Hidden Dialogflow Messenger Component - handles API communication */}
      <DialogflowMessenger ref={dialogflowMessengerRef} />
    </div>
  )
}
