import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import CourseDetailPage from './pages/CourseDetailPage'
import MainPage from './pages/MainPage'
import TripPlanPage from './pages/TripPlanPage'
import TripResultPage from './pages/TripResultPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/course/:courseId" element={<CourseDetailPage />} />
        <Route path="/course/:courseId/plan" element={<TripPlanPage />} />
        <Route path="/course/:courseId/result" element={<TripResultPage />} />
        {/* 없는 주소는 메인 화면으로 보낸다 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
