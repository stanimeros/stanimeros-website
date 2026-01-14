import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"

interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
}

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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
      console.log("Request sent to Dialogflow")
    }

    const handleMessengerLoaded = () => {
      console.log("Dialogflow Messenger loaded and ready")
    }

    window.addEventListener("df-response-received", handleResponseReceived)
    window.addEventListener("df-user-input-entered", handleUserInputEntered)
    window.addEventListener("df-request-sent", handleRequestSent)
    window.addEventListener("df-messenger-loaded", handleMessengerLoaded)

    return () => {
      window.removeEventListener("df-response-received", handleResponseReceived)
      window.removeEventListener("df-user-input-entered", handleUserInputEntered)
      window.removeEventListener("df-request-sent", handleRequestSent)
      window.removeEventListener("df-messenger-loaded", handleMessengerLoaded)
    }
  }, [])

  const addMessage = (text: string, isBot: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text,
      isBot,
      timestamp: new Date(),
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

  const handleSend = () => {
    if (!inputText.trim()) return

    const text = inputText.trim()
    
    // Add user message to UI immediately
    addMessage(text, false)
    sentMessagesRef.current.add(text)
    setInputText("")
    setIsLoading(true)

    // Send to Dialogflow
    sendMessageToDialogflow(text)
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

  return (
    <div className="flex flex-col h-full">
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

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4 bg-background">
        <div className="flex gap-2 max-w-4xl mx-auto">
          {/* Text Input */}
          <Textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ρωτήστε κάτι..."
            className="flex-1 min-h-[60px] max-h-[120px] resize-none"
            rows={1}
          />

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            size="icon"
            className="h-[60px] w-[60px]"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
