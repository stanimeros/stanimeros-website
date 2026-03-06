import { lazy, Suspense } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useEffect } from "react"

const HomePage = lazy(() => import("@/pages/HomePage"))
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"))
const DataDeletion = lazy(() => import("@/pages/DataDeletion"))
const GetStarted = lazy(() => import("@/pages/GetStarted"))
const QRCodeGenerator = lazy(() => import("@/pages/QRCodeGenerator"))
const ImageConverter = lazy(() => import("@/pages/ImageConverter"))
const VideoCompressor = lazy(() => import("@/pages/VideoCompressor"))

function App() {
  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/data-deletion" element={<DataDeletion />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/tools/qr-code" element={<QRCodeGenerator />} />
          <Route path="/tools/image-converter" element={<ImageConverter />} />
          <Route path="/tools/video-compressor" element={<VideoCompressor />} />
          {/* <Route path="test/86d66a1b-f8e8-40d3-bc74-920824fee993" element={<CustomChat />} /> */}
          <Route path="*" element={<HomePage />} />
        </Routes>
        </Suspense>
      </div>
    </Router>
  )
}

export default App