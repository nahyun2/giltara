import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router'
import CourseMap from '../components/CourseMap'
import Icon from '../components/Icon'
import PlaceCard from '../components/PlaceCard'
import { courses } from '../data/courses'

/** 코스 상세 화면: 지도 + 방문 순서대로 장소 목록 */
export default function CourseDetailPage() {
  const { courseId } = useParams()
  const course = courses.find((c) => c.id === courseId)

  const places = useMemo(
    () => (course ? [...course.places].sort((a, b) => a.order - b.order) : []),
    [course],
  )

  // 목록에서 내려온 스크롤 위치가 남지 않게 맨 위에서 시작한다
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [courseId])

  const backLink = (
    <Link
      to="/"
      className="inline-flex h-touch items-center gap-2 self-start rounded-lg pr-3 text-body font-bold text-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-dark"
    >
      <Icon name="back" className="size-6" />
      코스 목록으로
    </Link>
  )

  if (!course) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-page flex-col gap-6 px-4 pt-5 pb-12">
        {backLink}
        <p className="text-body text-text-sub">찾는 코스가 없어요.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-page flex-col gap-6 px-4 pt-5 pb-12">
      {backLink}

      <header className="flex flex-col gap-2">
        <p className="inline-flex items-center gap-1.5 self-start rounded-lg bg-accent px-3 py-1 text-caption font-bold text-on-color">
          <Icon name="tv" className="size-5" />
          {course.program} {course.episode}회 · {course.city}
        </p>
        <h1 className="text-screen-title font-bold text-text">{course.title}</h1>
        <p className="text-body text-text-sub">{course.summary}</p>
      </header>

      <CourseMap places={places} />

      <section aria-labelledby="place-list-heading" className="flex flex-col gap-4">
        <h2 id="place-list-heading" className="text-screen-title font-bold text-text">
          가는 순서 <span className="text-primary">{places.length}곳</span>
        </h2>
        <ol className="flex flex-col gap-4">
          {places.map((place) => (
            <li key={place.order}>
              <PlaceCard place={place} />
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
