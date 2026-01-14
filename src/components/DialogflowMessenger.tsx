import { useEffect, useRef, forwardRef, useImperativeHandle } from "react"

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

interface DialogflowMessengerProps {
  hideMessenger?: boolean
  location?: string
  projectId?: string
  agentId?: string
  languageCode?: string
  chatTitle?: string
  placeholderText?: string
}

export interface DialogflowMessengerRef {
  getMessenger: () => HTMLElement | null
}

const DialogflowMessenger = forwardRef<DialogflowMessengerRef, DialogflowMessengerProps>(
  (
    {
      hideMessenger = true,
      location = "eu",
      projectId = "biology-assistant",
      agentId = "86d66a1b-f8e8-40d3-bc74-920824fee993",
      languageCode = "el",
      chatTitle = "Βοηθός της Νίκης",
      placeholderText = "Ρωτήστε κάτι...",
    },
    ref
  ) => {
    const messengerRef = useRef<HTMLDivElement>(null)
    const scriptLoadedRef = useRef(false)

    // Expose messenger element via ref
    useImperativeHandle(ref, () => ({
      getMessenger: () => {
        return document.querySelector("df-messenger")
      },
    }))

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
    }, [])

    // Create/update messenger
    useEffect(() => {
      const createMessenger = () => {
        if (messengerRef.current && (scriptLoadedRef.current || window.customElements?.get('df-messenger'))) {
          // Clear any existing messenger in the ref container
          if (messengerRef.current) {
            messengerRef.current.innerHTML = ""
          }

          const dfMessenger = document.createElement("df-messenger")
          dfMessenger.setAttribute("location", location)
          dfMessenger.setAttribute("project-id", projectId)
          dfMessenger.setAttribute("agent-id", agentId)
          dfMessenger.setAttribute("language-code", languageCode)
          dfMessenger.setAttribute("max-query-length", "-1")
          
          const chatBubble = document.createElement("df-messenger-chat-bubble")
          chatBubble.setAttribute("chat-title", chatTitle)
          chatBubble.setAttribute("placeholder-text", placeholderText)
          dfMessenger.appendChild(chatBubble)
          
          messengerRef.current.appendChild(dfMessenger)
        } else {
          setTimeout(createMessenger, 100)
        }
      }

      // Add/update styles
      const styleId = "df-messenger-styles"
      let style = document.getElementById(styleId) as HTMLStyleElement
      if (!style) {
        style = document.createElement("style")
        style.id = styleId
        document.head.appendChild(style)
      }
      
      style.textContent = `
        df-messenger {
          ${hideMessenger ? 'display: none !important; visibility: hidden !important; opacity: 0 !important;' : ''}
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

      // Cleanup function
      return () => {
        if (messengerRef.current) {
          messengerRef.current.innerHTML = ""
        }
      }
    }, [hideMessenger, location, projectId, agentId, languageCode, chatTitle, placeholderText])

    return <div ref={messengerRef} />
  }
)

DialogflowMessenger.displayName = "DialogflowMessenger"

export default DialogflowMessenger
