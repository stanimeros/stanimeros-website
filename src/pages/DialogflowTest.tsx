import { useEffect, useRef } from "react"
import Header from "@/components/Header"
import ParticlesBackground from "@/components/ParticlesBackground"
import CustomChat from "@/components/CustomChat"

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

const DialogflowTest = () => {
  const messengerRef = useRef<HTMLDivElement>(null)
  const scriptLoadedRef = useRef(false)

  // Load script and CSS only once
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

  // Create/update messenger when mode changes
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
        /* Temporarily visible for debugging - to inspect HTML structure */
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


  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <ParticlesBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
      
      {/* Content */}
      <div className="relative z-10">
        <Header />
        <div className="fixed inset-0 pt-24 flex flex-col">
          {/* Full screen chatbot */}
          <div className="flex-1 overflow-hidden">
            <CustomChat />
          </div>
        </div>
      </div>
      
      {/* Hidden Dialogflow Messenger Component - handles API communication */}
      <div ref={messengerRef} />
    </div>
  )
}

export default DialogflowTest