import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import Icon from '../components/Icon'
import { courses } from '../data/courses'
import { PLACE_CATEGORY_LABEL } from '../types/course'

/**
 * 코스 상세 화면.
 * 임시 화면: 상세 화면 시안(#9)이 나오면 지도와 장소별 버튼을 붙여 다시 만든다.
 */
export default function CourseDetailPage() {
  const { courseId } = useParams()
  const course = courses.find((c) => c.id === courseId)

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

  const places = [...course.places].sort((a, b) => a.order - b.order)

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-page flex-col gap-6 px-4 pt-5 pb-12">
      {backLink}

      <header className="flex flex-col gap-2">
        <p className="flex items-center gap-1.5 text-caption font-bold text-accent">
          <Icon name="tv" className="size-5" />
          {course.program} {course.episode}회 · {course.city}
        </p>
        <h1 className="text-screen-title font-bold text-text">{course.title}</h1>
        <p className="text-body text-text-sub">{course.summary}</p>
      </header>

      <section aria-labelledby="place-list-heading" className="flex flex-col gap-3">
        <h2 id="place-list-heading" className="text-card-title font-bold text-text">
          가는 순서 <span className="text-primary">{places.length}곳</span>
        </h2>
        <ol className="flex flex-col gap-3">
          {places.map((place) => (
            <li
              key={place.order}
              className="flex items-start gap-3 rounded-2xl bg-card p-4 shadow-md"
            >
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-body font-bold text-on-color">
                {place.order}
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-card-title font-bold text-text">{place.name}</p>
                <p className="flex items-center gap-1.5 text-caption text-text-sub">
                  <Icon name={place.category} className="size-5" />
                  {PLACE_CATEGORY_LABEL[place.category]} · {place.address ?? place.district}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
