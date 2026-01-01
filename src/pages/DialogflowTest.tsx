import { useEffect, useRef, useState } from "react"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/button"

const DialogflowTest = () => {
  const messengerRef = useRef<HTMLDivElement>(null)
  const [isBubbleMode, setIsBubbleMode] = useState(true)
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
          dfMessenger.setAttribute("gcs-upload", "testing-bucket-upload-photo")
          
          if (isBubbleMode) {
            const chatBubble = document.createElement("df-messenger-chat-bubble")
            chatBubble.setAttribute("chat-title", "Βοηθός της Νίκης")
            chatBubble.setAttribute("placeholder-text", "Ρωτήστε κάτι...")
            // chatBubble.setAttribute("enable-file-upload", "")
            // chatBubble.setAttribute("enable-audio-input", "")
            dfMessenger.appendChild(chatBubble)
          } else {
            const chat = document.createElement("df-messenger-chat")
            chat.setAttribute("chat-title", "Βοηθός της Νίκης")
            chat.setAttribute("placeholder-text", "Ρωτήστε κάτι...")
            // chat.setAttribute("enable-file-upload", "")
            // chat.setAttribute("enable-audio-input", "")
            dfMessenger.appendChild(chat)
          }
          
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
        z-index: 999;
        position: fixed;
        --df-messenger-font-color: #000;
        --df-messenger-font-family: Google Sans;
        --df-messenger-chat-background: #f3f6fc;
        --df-messenger-message-user-background: #d3e3fd;
        --df-messenger-message-bot-background: #fff;
        ${isBubbleMode 
          ? `bottom: 16px; right: 16px;` 
          : `bottom: 0; right: 0; top: 0; width: 350px;`
        }
      }
    `

    createMessenger()

    // Cleanup function - remove all messengers when component unmounts or mode changes
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
  }, [isBubbleMode])

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-3xl">
          <h1 className="text-4xl font-bold mb-6">Σελίδα Δοκιμής AI Agent</h1>
          
          <div className="mb-6">
            <Button 
              onClick={() => setIsBubbleMode(!isBubbleMode)}
              variant="outline"
            >
              {isBubbleMode ? "Εμφάνιση Πλήρους Chat" : "Εμφάνιση Chat Bubble"}
            </Button>
          </div>
          
          <div className="bg-card/70 border border-border/60 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-2xl font-semibold mb-4">Πληροφορίες</h2>
            <p className="text-muted-foreground mb-4">
              Αυτή είναι μια σελίδα δοκιμής για τον AI βοηθό της <strong>Νίκης Μαργαρίτη</strong>.
            </p>
            <p className="text-muted-foreground mb-4">
              Ο βοηθός έχει φορτωθεί με βιβλία <strong>Βιολογίας Β' και Γ' Λυκείου</strong> και είναι έτοιμος να απαντήσει σε ερωτήσεις σχετικές με τη βιολογία.
            </p>
            <p className="text-muted-foreground">
              Το widget συνομιλίας εμφανίζεται στην κάτω δεξιά γωνία της σελίδας.
            </p>
          </div>

          <div className="bg-card/70 border border-border/60 rounded-lg p-6 text-left">
            <h2 className="text-2xl font-semibold mb-4">Προτεινόμενες Ερωτήσεις</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Τι είναι το DNA και πώς λειτουργεί;</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Πώς γίνεται η φωτοσύνθεση;</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Εξήγησε τη διαδικασία της κυτταρικής αναπαραγωγής</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Τι είναι τα ενζύμια και ποιος ο ρόλος τους;</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Πώς λειτουργεί το ανοσοποιητικό σύστημα;</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Εξήγησε τη διαφορά μεταξύ μίτωσης και μείωσης</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Container for Dialogflow Messenger Component */}
      <div ref={messengerRef} />
    </Layout>
  )
}

export default DialogflowTest

