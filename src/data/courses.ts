import type { Course } from '../types/course'
import sampleCourses from './courses.sample.json'

/**
 * 임시 코스 데이터.
 * JSON은 category를 string으로 추론하므로 여기서 한 번만 Course[]로 지정한다.
 */
export const courses: Course[] = sampleCourses as Course[]
