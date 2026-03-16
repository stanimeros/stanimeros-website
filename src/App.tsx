import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import HomePage from "@/pages/HomePage"
import PrivacyPolicy from "@/pages/PrivacyPolicy"
import DataDeletion from "@/pages/DataDeletion"
import GetStarted from "@/pages/GetStarted"
import QRCodeGenerator from "@/pages/QRCodeGenerator"
import ImageConverter from "@/pages/ImageConverter"
import VideoCompressor from "@/pages/VideoCompressor"
import LangRoute from "@/components/LangRoute"

function App() {
  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          {/* Routes without lang prefix (language from detector) */}
          <Route path="/" element={<HomePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/data-deletion" element={<DataDeletion />} />
          <Route path="/data-deletion/:appSlug" element={<DataDeletion />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/tools/qr-code" element={<QRCodeGenerator />} />
          <Route path="/tools/image-converter" element={<ImageConverter />} />
          <Route path="/tools/video-compressor" element={<VideoCompressor />} />
          {/* /en and /el force language via URL */}
          <Route path="/:lang" element={<LangRoute />}>
            <Route index element={<HomePage />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="data-deletion" element={<DataDeletion />} />
            <Route path="data-deletion/:appSlug" element={<DataDeletion />} />
            <Route path="get-started" element={<GetStarted />} />
            <Route path="tools/qr-code" element={<QRCodeGenerator />} />
            <Route path="tools/image-converter" element={<ImageConverter />} />
            <Route path="tools/video-compressor" element={<VideoCompressor />} />
            <Route path="*" element={<HomePage />} />
          </Route>
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App