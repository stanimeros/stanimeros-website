import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2, Paperclip, X, Trash2, User, Bot } from "lucide-react"
import { analyzeFileWithGemini } from "@/lib/gemini"
import Header from "@/components/Header"
import ParticlesBackground from "@/components/ParticlesBackground"

// Extend Window interface to include Dialogflow utility and messenger
declare global {
  interface Window {
    dfInstallUtil?: (feature: string, options: { bucketName: string }) => void
  }
  
  interface HTMLElementTagNameMap {
    'df-messenger': HTMLElement & {
      renderCustomText?: (text: string, isBot?: boolean) => void
    }
  }
}

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
  // Flag to hide/show the actual df-messenger UI
  const HIDE_DF_MESSENGER = true
  
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
  const messengerRef = useRef<HTMLDivElement>(null)
  const scriptLoadedRef = useRef(false)

  // Load Dialogflow script and CSS
  useEffect(() => {
    // Add the Dialogflow CSS link
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/themes/df-messenger-default.css"
    document.head.appendChild(link)

    // Load the Dialogflow script
    const existingScript = document.querySelector('script[src*="df-messenger.js"]')
    if (!existingScript) {
      const script = document.createElement("script")
      script.src = "https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js"
      script.async = true
      script.onload = () => {
        scriptLoadedRef.current = true
      }
      document.body.appendChild(script)
    } else {
      scriptLoadedRef.current = true
    }

    // Cleanup function
    return () => {
      // Don't remove link/script on cleanup as they might be needed
    }
  }, [])

  // Create/update messenger
  useEffect(() => {
    const removeAllMessengers = () => {
      // Remove all df-messenger elements from the entire DOM, not just the ref container
      const allMessengers = document.querySelectorAll('df-messenger')
      allMessengers.forEach(messenger => {
        // Remove from parent if it exists
        if (messenger.parentNode) {
          messenger.parentNode.removeChild(messenger)
        }
        // Also try to remove it directly
        messenger.remove()
      })
      
      // Also clear the ref container
      if (messengerRef.current) {
        messengerRef.current.innerHTML = ""
      }
    }

    const createMessenger = () => {
      // First, completely remove any existing messengers
      removeAllMessengers()

      // Wait a bit for script to be ready and for cleanup to complete
      const checkAndCreate = () => {
        // Double check that no messengers exist
        const existingMessengers = document.querySelectorAll('df-messenger')
        if (existingMessengers.length > 0) {
          removeAllMessengers()
          setTimeout(checkAndCreate, 50)
          return
        }

        if (messengerRef.current && (scriptLoadedRef.current || window.customElements?.get('df-messenger'))) {
          const dfMessenger = document.createElement("df-messenger")
          dfMessenger.setAttribute("location", "eu")
          dfMessenger.setAttribute("project-id", "biology-assistant")
          dfMessenger.setAttribute("agent-id", "86d66a1b-f8e8-40d3-bc74-920824fee993")
          dfMessenger.setAttribute("language-code", "el")
          dfMessenger.setAttribute("max-query-length", "-1")
          dfMessenger.setAttribute("allow-feedback", "all")
          dfMessenger.setAttribute("storage-option", "sessionStorage")
          
          // Use chat-bubble (no file upload for now)
          const chatBubble = document.createElement("df-messenger-chat-bubble")
          chatBubble.setAttribute("chat-title", "Βοηθός της Νίκης")
          chatBubble.setAttribute("placeholder-text", "Ρωτήστε κάτι...")
          dfMessenger.appendChild(chatBubble)
          
          messengerRef.current.appendChild(dfMessenger)
        } else {
          setTimeout(checkAndCreate, 100)
        }
      }
      
      // Small delay to ensure cleanup is complete
      setTimeout(checkAndCreate, 100)
    }

    // Add/update styles based on mode
    const styleId = "df-messenger-styles"
    let style = document.getElementById(styleId) as HTMLStyleElement
    if (!style) {
      style = document.createElement("style")
      style.id = styleId
      document.head.appendChild(style)
    }
    
    style.textContent = `
      df-messenger {
        ${HIDE_DF_MESSENGER ? 'display: none !important; visibility: hidden !important; opacity: 0 !important;' : ''}
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        /* Keep all the CSS variables for internal functionality */
        --df-messenger-font-color: #000;
        --df-messenger-font-family: Google Sans;
        --df-messenger-chat-background: #f3f6fc;
        --df-messenger-message-user-background: #d3e3fd;
        --df-messenger-message-bot-background: #fff;
      }
    `

    createMessenger()

    // Cleanup function - remove all messengers when component unmounts
    return () => {
      // Remove all df-messenger elements from the entire DOM
      const allMessengers = document.querySelectorAll('df-messenger')
      allMessengers.forEach(messenger => {
        if (messenger.parentNode) {
          messenger.parentNode.removeChild(messenger)
        }
        messenger.remove()
      })
      
      // Also clear the ref container
      if (messengerRef.current) {
        messengerRef.current.innerHTML = ""
      }
    }
  }, [])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

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
            const existingTexts = new Set(prev.map(m => `${m.text}-${m.isBot}`))
            const newMessages = restoredMessages.filter(m => {
              const existsById = existingIds.has(m.id)
              const existsByText = existingTexts.has(`${m.text}-${m.isBot}`)
              if (existsById || existsByText) {
                console.log('[loadMessagesFromDialogflow] Filtering duplicate:', { text: m.text.substring(0, 50), existsById, existsByText })
              }
              return !existsById && !existsByText
            })
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
      <div ref={messengerRef} />
    </div>
  )
}
