import { useMemo, useState } from 'react'
import CourseCard from '../components/CourseCard'
import FilterChips from '../components/FilterChips'
import Icon from '../components/Icon'
import { courses } from '../data/courses'

/** 데이터에 나온 순서대로 중복 없이 모은다 */
function unique(values: string[]): string[] {
  return [...new Set(values)]
}

export default function MainPage() {
  const [program, setProgram] = useState<string | null>(null)
  const [city, setCity] = useState<string | null>(null)

  const programs = useMemo(() => unique(courses.map((c) => c.program)), [])
  const cities = useMemo(() => unique(courses.map((c) => c.city)), [])

  const filtered = courses.filter(
    (c) => (program === null || c.program === program) && (city === null || c.city === city),
  )

  const heading = [program, city].filter(Boolean).join(' · ') || '전체'

  const resetFilters = () => {
    setProgram(null)
    setCity(null)
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-page flex-col gap-8 px-4 pt-5 pb-12">
      <header>
        <h1 className="flex items-center gap-2 text-screen-title font-bold text-primary">
          <Icon name="logo" className="size-7" />
          길따라
        </h1>
      </header>

      <section aria-label="코스 고르기" className="flex flex-col gap-6">
        <FilterChips
          label="방송 프로그램"
          icon="tv"
          options={programs}
          selected={program}
          onChange={setProgram}
        />
        <FilterChips
          label="여행 도시"
          icon="pin"
          options={cities}
          selected={city}
          onChange={setCity}
        />
      </section>

      <section aria-labelledby="course-list-heading" className="flex flex-col gap-4">
        <h2
          id="course-list-heading"
          aria-live="polite"
          className="text-screen-title font-bold text-text"
        >
          {heading} 코스 <span className="text-primary">{filtered.length}개</span>
        </h2>

        {filtered.length > 0 ? (
          <ul className="flex flex-col gap-6">
            {filtered.map((course) => (
              <li key={course.id}>
                <CourseCard course={course} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-card px-5 py-10 text-center shadow-md">
            <p className="text-body text-text-sub">조건에 맞는 코스가 없어요.</p>
            <button
              type="button"
              onClick={resetFilters}
              className="flex h-button w-full items-center justify-center rounded-xl bg-primary text-button font-bold text-on-color hover:bg-primary-dark focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-dark"
            >
              전체 코스 보기
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
