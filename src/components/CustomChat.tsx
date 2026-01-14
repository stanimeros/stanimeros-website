import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Send, Loader2, Paperclip, X, Trash2 } from "lucide-react"
import { analyzeImageWithGemini } from "@/lib/gemini"

interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
  fileName?: string
}

// Dialogflow stores messages in sessionStorage with key "df-messenger-messages"
const DIALOGFLOW_MESSAGES_KEY = "df-messenger-messages"

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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [inputText])

  // Track sent messages to avoid duplicates
  const sentMessagesRef = useRef<Set<string>>(new Set())

  // Initial load of messages from Dialogflow's sessionStorage on mount
  // Note: Messages are loaded via the df-messenger-message-list-loaded event handler
  // This effect is kept as a fallback but the main loading happens in event handlers

  // Listen to Dialogflow events
  useEffect(() => {
    const handleResponseReceived = (event: Event) => {
      const customEvent = event as CustomEvent<{ messages: Array<{ type: string; text: string }> }>
      const responseMessages = customEvent.detail?.messages || []

      responseMessages.forEach((msg) => {
        if (msg.type === "text" && msg.text) {
          addMessage(msg.text, true)
        }
      })

      setIsLoading(false)
    }

    const handleUserInputEntered = (event: Event) => {
      const customEvent = event as CustomEvent<{ input: string; file?: File }>
      const input = customEvent.detail?.input

      if (input && !customEvent.detail?.file) {
        // Only add if we haven't already added this message
        // (handleSend/handleSuggestedQuestion add it before sending)
        if (!sentMessagesRef.current.has(input)) {
          addMessage(input, false)
          sentMessagesRef.current.add(input)
        }
        setIsLoading(true)
      }
    }

    const handleRequestSent = () => {
      // Request was sent successfully
    }

    const handleMessengerLoaded = () => {
      // Restore messages when messenger is loaded
      loadMessagesFromDialogflow()
    }

    const handleMessageListLoaded = () => {
      // Dialogflow has loaded its message list, wait longer for sessionStorage to be updated
      // Try multiple times with increasing delays
      setTimeout(() => {
        loadMessagesFromDialogflow()
        // Also try DOM extraction as fallback
        extractFromDOM()
      }, 500)
      setTimeout(() => {
        loadMessagesFromDialogflow()
        extractFromDOM()
      }, 1000)
      setTimeout(() => {
        loadMessagesFromDialogflow()
        extractFromDOM()
      }, 2000)
    }
    
    const extractFromDOM = () => {
      try {
        // Find .entry.user and .entry.bot elements directly in the DOM
        const entries = document.querySelectorAll(".entry.user, .entry.bot")
        
        if (entries.length > 0) {
          extractMessagesFromEntries(Array.from(entries))
        }
      } catch (error) {
        console.error("Error extracting from DOM:", error)
      }
    }
    
    const extractMessagesFromEntries = (entries: Element[]) => {
      const restoredMessages: Message[] = []
      
      entries.forEach((entry: Element, index: number) => {
        const isBot = entry.classList.contains('bot')
        
        // Find the df-messenger-utterance inside the entry
        const utterance = entry.querySelector("df-messenger-utterance")
        if (!utterance?.shadowRoot) return

        // Find the message element inside the utterance shadow DOM
        // Could be df-text-message or df-markdown-message
        const textMessage = utterance.shadowRoot.querySelector("df-text-message")
        const markdownMessage = utterance.shadowRoot.querySelector("df-markdown-message")
        
        let messageElement: Element | null = null
        if (textMessage?.shadowRoot) {
          messageElement = textMessage.shadowRoot.querySelector(".message.user-message, .message.bot-message")
        } else if (markdownMessage?.shadowRoot) {
          messageElement = markdownMessage.shadowRoot.querySelector(".message.user-message, .message.bot-message")
        }

        if (!messageElement) return

        // Extract text content - could be in a div or p tag
        let textContent = ""
        const textDiv = messageElement.querySelector("div, p")
        if (textDiv) {
          textContent = textDiv.textContent?.trim() || ""
        } else {
          textContent = messageElement.textContent?.trim() || ""
        }

        if (textContent && textContent.length > 0) {
          // Skip if it's a duplicate
          const existingText = restoredMessages.find(m => m.text === textContent)
          if (!existingText) {
            restoredMessages.push({
              id: `dom-${index}-${Date.now()}`,
              text: textContent,
              isBot: isBot,
              timestamp: new Date(),
            })
          }
        }
      })
      
      if (restoredMessages.length > 0) {
        setMessages(prev => {
          const existingTexts = new Set(prev.map(m => m.text))
          const newMessages = restoredMessages.filter(m => !existingTexts.has(m.text))
          return newMessages.length > 0 ? [...prev, ...newMessages] : prev
        })
      }
    }

    const loadMessagesFromDialogflow = () => {
      try {
        // Check all sessionStorage keys to find Dialogflow messages
        let stored = sessionStorage.getItem(DIALOGFLOW_MESSAGES_KEY)
        
        // If not found with default key, check all keys
        if (!stored) {
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i)
            if (!key) continue
            
            // Skip non-Dialogflow keys
            if (key.includes('-reaction') || key === 'chatBubbleExpansion' || key === 'chatScrollDistance' || 
                key === 'sessionID' || key === 'isWaitingForElement' || key === 'lastResponseInstant' ||
                key.startsWith('dfMessenger-') && !key.includes('message')) {
              continue
            }
            
            const value = sessionStorage.getItem(key)
            if (value && value.length > 10) { // At least some content
              try {
                const parsed = JSON.parse(value)
                // Check if it looks like Dialogflow message data
                if (parsed.utteranceId || 
                    (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.utteranceId) ||
                    (typeof parsed === 'object' && Object.keys(parsed).some(k => k.includes('utterance') || k.includes('message')))) {
                  stored = value
                  break
                }
              } catch (e) {
                // Not JSON, skip
              }
            }
          }
        }
        
        if (!stored) {
          return
        }
        
        // Try to parse the data - it might be multiple JSON objects or malformed
        let dialogflowData: any
        try {
          dialogflowData = JSON.parse(stored)
        } catch (parseError: any) {
          // If parsing fails, try to extract valid JSON objects
          try {
            // Try splitting by potential separators or finding individual objects
            // Dialogflow might store multiple JSON objects
            const lines = stored.split('\n').filter(l => l.trim())
            const parsedObjects: any[] = []
            
            for (const line of lines) {
              try {
                const parsed = JSON.parse(line.trim())
                if (parsed.utteranceId || parsed.queryText || parsed.responseMessages) {
                  parsedObjects.push(parsed)
                }
              } catch (e) {
                // Not a valid JSON line, skip
              }
            }
            
            // If that didn't work, try regex to find JSON objects
            if (parsedObjects.length === 0) {
              const jsonPattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g
              let match
              while ((match = jsonPattern.exec(stored)) !== null) {
                try {
                  const parsed = JSON.parse(match[0])
                  if (parsed.utteranceId || parsed.queryText || parsed.responseMessages) {
                    parsedObjects.push(parsed)
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
            
            if (parsedObjects.length > 0) {
              dialogflowData = parsedObjects
            } else {
              console.error("Could not extract any valid JSON objects, trying DOM extraction")
              extractFromDOM()
              return
            }
          } catch (e) {
            console.error("Failed to parse Dialogflow messages, trying DOM extraction:", e)
            extractFromDOM()
            return
          }
        }
        
        const restoredMessages: Message[] = []
        let messagesArray: any[] = []
        
        if (Array.isArray(dialogflowData)) {
          messagesArray = dialogflowData
        } else if (dialogflowData.utteranceId) {
          // Single message object
          messagesArray = [dialogflowData]
        } else if (dialogflowData.messages && Array.isArray(dialogflowData.messages)) {
          messagesArray = dialogflowData.messages
        } else {
          // Try to find messages in nested structure
          const findMessages = (obj: any, depth = 0): any[] => {
            if (depth > 3) return []
            if (Array.isArray(obj)) return obj
            if (obj && typeof obj === 'object') {
              if (obj.utteranceId) return [obj]
              for (const key in obj) {
                if (key.toLowerCase().includes('message') || key.toLowerCase().includes('utterance')) {
                  const found = findMessages(obj[key], depth + 1)
                  if (found.length > 0) return found
                }
              }
            }
            return []
          }
          messagesArray = findMessages(dialogflowData)
        }
        
        messagesArray.forEach((msg: any, index: number) => {
          const isBot = msg.isBot === true
          
          // Check if it has messages array (Dialogflow CX format)
          if (msg.messages && Array.isArray(msg.messages)) {
            msg.messages.forEach((messageItem: any, msgIndex: number) => {
              // Extract text from the message item
              let textContent = ""
              
              if (messageItem.text) {
                // Handle different text formats
                if (typeof messageItem.text === 'string') {
                  textContent = messageItem.text
                } else if (messageItem.text.text) {
                  if (Array.isArray(messageItem.text.text)) {
                    textContent = messageItem.text.text.join(' ')
                  } else if (typeof messageItem.text.text === 'string') {
                    textContent = messageItem.text.text
                  }
                }
              } else if (messageItem.payload) {
                // Might be in payload - try to extract text
                if (typeof messageItem.payload === 'string') {
                  try {
                    const payload = JSON.parse(messageItem.payload)
                    if (payload.text) {
                      textContent = typeof payload.text === 'string' ? payload.text : JSON.stringify(payload.text)
                    }
                  } catch (e) {
                    textContent = messageItem.payload
                  }
                } else if (messageItem.payload?.text) {
                  textContent = typeof messageItem.payload.text === 'string' ? messageItem.payload.text : JSON.stringify(messageItem.payload.text)
                } else {
                  // Try to stringify the whole payload
                  textContent = JSON.stringify(messageItem.payload)
                }
              } else if (messageItem.type === 'text' && messageItem.content) {
                // Alternative format
                textContent = messageItem.content
              } else if (typeof messageItem === 'string') {
                // Message item is directly a string
                textContent = messageItem
              }
              
              if (textContent && textContent.trim()) {
                restoredMessages.push({
                  id: `${msg.utteranceId || 'msg'}-${index}-${msgIndex}`,
                  text: textContent.trim(),
                  isBot: isBot,
                  timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
                })
              }
            })
          }
          
          // Fallback: check for queryText (user input)
          if (msg.queryText) {
            const userText = msg.queryText
            if (!sentMessagesRef.current.has(userText)) {
              restoredMessages.push({
                id: msg.utteranceId || `user-${Date.now()}-${index}`,
                text: userText,
                isBot: false,
                timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
              })
              sentMessagesRef.current.add(userText)
            }
          }
          
          // Fallback: check for responseMessages (old format)
          if (msg.responseMessages && Array.isArray(msg.responseMessages)) {
            msg.responseMessages.forEach((response: any, respIndex: number) => {
              if (response.text) {
                // Handle different response formats
                let texts: string[] = []
                if (response.text.text && Array.isArray(response.text.text)) {
                  texts = response.text.text
                } else if (typeof response.text === 'string') {
                  texts = [response.text]
                } else if (response.text.text && typeof response.text.text === 'string') {
                  texts = [response.text.text]
                }
                
                texts.forEach((text: string) => {
                  if (text && text.trim()) {
                    restoredMessages.push({
                      id: `${msg.utteranceId || 'response'}-${index}-${respIndex}-${Math.random().toString(36).substr(2, 9)}`,
                      text: text.trim(),
                      isBot: true,
                      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
                    })
                  }
                })
              }
            })
          }
        })
        
        if (restoredMessages.length > 0) {
          restoredMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id))
            const newMessages = restoredMessages.filter(m => !existingIds.has(m.id))
            if (newMessages.length > 0) {
              return [...prev, ...newMessages].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
            }
            return prev
          })
        }
      } catch (error) {
        console.error("Error loading messages from Dialogflow sessionStorage:", error)
      }
    }


    window.addEventListener("df-response-received", handleResponseReceived)
    window.addEventListener("df-user-input-entered", handleUserInputEntered)
    window.addEventListener("df-request-sent", handleRequestSent)
    window.addEventListener("df-messenger-loaded", handleMessengerLoaded)
    window.addEventListener("df-messenger-message-list-loaded", handleMessageListLoaded)

    return () => {
      window.removeEventListener("df-response-received", handleResponseReceived)
      window.removeEventListener("df-user-input-entered", handleUserInputEntered)
      window.removeEventListener("df-request-sent", handleRequestSent)
      window.removeEventListener("df-messenger-loaded", handleMessengerLoaded)
      window.removeEventListener("df-messenger-message-list-loaded", handleMessageListLoaded)
    }
  }, [])

  const addMessage = (text: string, isBot: boolean, fileName?: string) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text,
      isBot,
      timestamp: new Date(),
      fileName,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const sendMessageToDialogflow = (text: string): boolean => {
    const messenger = document.querySelector("df-messenger")
    if (!messenger) {
      console.error("df-messenger not found")
      return false
    }

    // Wait for messenger to be ready
    const trySend = (attempts = 0): boolean => {
      if (attempts > 10) {
        console.error("Failed to send message after multiple attempts")
        return false
      }

      const chatBubble = messenger.querySelector("df-messenger-chat-bubble")
      if (!chatBubble) {
        setTimeout(() => trySend(attempts + 1), 100)
        return false
      }

      const chatBubbleShadow = chatBubble.shadowRoot
      if (!chatBubbleShadow) {
        setTimeout(() => trySend(attempts + 1), 100)
        return false
      }

      const chat = chatBubbleShadow.querySelector("df-messenger-chat")
      if (!chat?.shadowRoot) {
        setTimeout(() => trySend(attempts + 1), 100)
        return false
      }

      const userInput = chat.shadowRoot.querySelector("df-messenger-user-input")
      if (!userInput?.shadowRoot) {
        setTimeout(() => trySend(attempts + 1), 100)
        return false
      }

      // Find textarea
      const textarea = userInput.shadowRoot.querySelector(
        'textarea.input-box'
      ) as HTMLTextAreaElement

      // Find send button
      const sendButton = userInput.shadowRoot.querySelector(
        'button#send-icon-button'
      ) as HTMLButtonElement

      if (!textarea) {
        setTimeout(() => trySend(attempts + 1), 100)
        return false
      }

      // Set the text value
      textarea.value = text
      
      // Trigger input event to update the messenger's internal state
      const inputEvent = new Event("input", { bubbles: true, cancelable: true })
      textarea.dispatchEvent(inputEvent)
      
      // Also trigger change event
      const changeEvent = new Event("change", { bubbles: true, cancelable: true })
      textarea.dispatchEvent(changeEvent)

      // Click send button if available
      if (sendButton && !sendButton.disabled) {
        sendButton.click()
        return true
      } else {
        // Try Enter key as fallback
        const enterEvent = new KeyboardEvent("keydown", {
          key: "Enter",
          code: "Enter",
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true,
        })
        textarea.dispatchEvent(enterEvent)
        return true
      }
    }

    return trySend()
  }

  const handleSend = async () => {
    if (!inputText.trim() && !selectedFile) return

    const text = inputText.trim()
    const fileName = selectedFile?.name || undefined
    const fileToAnalyze = selectedFile
    
    // Clear file from input section immediately
    setSelectedFile(null)
    setInputText("")
    
    // Display only the input text in the chat (not the analysis)
    const displayText = text || (fileName ? `Εικόνα: ${fileName}` : "")
    
    // If there's a file, analyze it first for Dialogflow
    let finalText = text
    if (fileToAnalyze && fileName) {
      setIsAnalyzingImage(true)
      setAnalyzingFileName(fileName)
      try {
        const analysis = await analyzeImageWithGemini(fileToAnalyze)
        if (analysis.error) {
          // Show error message
          addMessage(`Σφάλμα ανάλυσης εικόνας: ${analysis.error}`, false, fileName)
          setIsAnalyzingImage(false)
          setAnalyzingFileName(null)
          return
        }
        // Combine input text with Gemini analysis for Dialogflow
        if (text) {
          finalText = `${text}\n\n[Ανάλυση εικόνας "${fileName}"]:\n${analysis.text}`
        } else {
          finalText = `[Ανάλυση εικόνας "${fileName}"]:\n${analysis.text}`
        }
      } catch (error) {
        console.error("Error analyzing image:", error)
        addMessage(`Σφάλμα ανάλυσης εικόνας: ${error instanceof Error ? error.message : "Άγνωστο σφάλμα"}`, false, fileName)
        setIsAnalyzingImage(false)
        setAnalyzingFileName(null)
        return
      } finally {
        setIsAnalyzingImage(false)
        setAnalyzingFileName(null)
      }
    }
    
    // Add user message to UI (only input text + file name indicator)
    addMessage(displayText, false, fileName)
    sentMessagesRef.current.add(finalText)
    setIsLoading(true)

    // Send to Dialogflow (input text + image analysis)
    sendMessageToDialogflow(finalText)
  }

  const handleSuggestedQuestion = (question: string) => {
    // Add user message to UI immediately
    addMessage(question, false)
    sentMessagesRef.current.add(question)
    setIsLoading(true)

    // Send to Dialogflow
    sendMessageToDialogflow(question)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        alert('Παρακαλώ επιλέξτε ένα αρχείο εικόνας')
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
    
    // Clear Dialogflow's messages from sessionStorage
    try {
      sessionStorage.removeItem(DIALOGFLOW_MESSAGES_KEY)
      
      // Also try to clear other Dialogflow-related keys
      const keysToRemove: string[] = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && (key.includes('dfMessenger') || key.includes('reaction') || key === 'chatBubbleExpansion' || key === 'chatScrollDistance')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key))
      
      // Trigger Dialogflow to refresh by dispatching a custom event
      window.dispatchEvent(new CustomEvent('df-clear-messages'))
    } catch (error) {
      console.error("Error clearing Dialogflow messages:", error)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with Clear Button */}
      {messages.length > 0 && (
        <div className="flex justify-end p-2 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Καθαρισμός
          </Button>
        </div>
      )}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                  onClick={() => handleSuggestedQuestion(question)}
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
            className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.isBot
                  ? "bg-muted text-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {message.fileName && (
                <div className={`text-xs mb-2 pb-2 border-b ${
                  message.isBot ? "border-muted-foreground/20" : "border-primary-foreground/20"
                }`}>
                  📎 {message.fileName}
                </div>
              )}
              <div className="whitespace-pre-wrap break-words">{message.text}</div>
              <div
                className={`text-xs mt-1 ${
                  message.isBot ? "text-muted-foreground" : "text-primary-foreground/70"
                }`}
              >
                {message.timestamp.toLocaleTimeString("el-GR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}

        {(isLoading || isAnalyzingImage) && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {isAnalyzingImage && analyzingFileName ? (
                <span className="text-sm text-muted-foreground">Ανάλυση εικόνας: {analyzingFileName}</span>
              ) : (
                <span className="text-sm text-muted-foreground">Αναμονή απάντησης...</span>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4 bg-background">
        <div className="flex flex-col gap-2 max-w-4xl mx-auto">
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
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            
            {/* File Upload Button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-[60px] w-[60px]"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isAnalyzingImage}
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Text Input */}
            <Textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ρωτήστε κάτι..."
              className="flex-1 min-h-[60px] max-h-[120px] resize-none"
              rows={1}
              disabled={isAnalyzingImage}
            />

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={(!inputText.trim() && !selectedFile) || isLoading || isAnalyzingImage}
              size="icon"
              className="h-[60px] w-[60px]"
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
  )
}
