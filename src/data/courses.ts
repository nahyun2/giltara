import type { Course } from '../types/course'
import courseData from './courses.json'

/**
 * TV 코스 데이터 (<동네 한 바퀴> 회차 소개 글에서 Gemini로 추출 후 검수).
 * JSON은 category를 string으로 추론하므로 여기서 한 번만 Course[]로 지정한다.
 */
export const courses: Course[] = courseData as Course[]
