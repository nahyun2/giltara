import { useId } from 'react'
import { PLACE_CATEGORY_LABEL, type Course } from '../types/course'
import Icon from './Icon'

type Props = {
  course: Course
}

export default function CourseCard({ course }: Props) {
  const titleId = useId()
  const places = [...course.places].sort((a, b) => a.order - b.order)
  const [first, ...rest] = places

  return (
    <article
      aria-labelledby={titleId}
      className="flex flex-col gap-4 overflow-hidden rounded-2xl bg-card p-5 shadow-md"
    >
      {/* 1번 장소 사진 */}
      <div className="relative h-56 w-full overflow-hidden rounded-xl bg-chip">
        {first?.imageUrl ? (
          <img src={first.imageUrl} alt={first.name} className="size-full object-cover" />
        ) : (
          first && (
            <div className="flex size-full flex-col items-center justify-center gap-1 pb-16 text-text-sub">
              <Icon name={first.category} className="size-14" />
              <span className="text-caption font-medium">
                {PLACE_CATEGORY_LABEL[first.category]}
              </span>
            </div>
          )
        )}
        <div className="absolute inset-0 bg-linear-to-t from-overlay/75 via-overlay/25 via-45% to-transparent" />

        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1 text-caption font-bold text-on-color shadow">
          <Icon name="tv" className="size-5" />
          {course.program} · {course.episode}회
        </span>

        {first && (
          <div className="absolute right-4 bottom-3 left-4 text-on-color">
            <p className="flex items-center gap-1 text-caption font-bold">
              <Icon name="pin" className="size-5" />
              {first.district}
            </p>
            <p className="text-card-title font-bold">{first.name}</p>
          </div>
        )}
      </div>

      {/* 제목·소개 */}
      <div className="flex flex-col gap-1.5">
        <h3 id={titleId} className="line-clamp-2 text-card-title font-bold text-text">
          {course.title}
        </h3>
        <p className="line-clamp-2 text-body text-text-sub">{course.summary}</p>
      </div>

      {/* 함께 가는 곳 (누를 수 없는 표시용 태그) */}
      {rest.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-body font-bold text-text">함께 가는 곳</p>
          <ul className="flex flex-wrap gap-2">
            {rest.map((place) => (
              <li
                key={place.order}
                className="inline-flex items-center gap-2 rounded-full bg-bg py-1.5 pr-4 pl-1.5 text-body text-text"
              >
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary text-on-color">
                  <Icon name={place.category} className="size-4.5" />
                </span>
                {place.name}
                <span className="sr-only">({PLACE_CATEGORY_LABEL[place.category]})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 화면 이동은 코스 상세 화면을 만들 때 연결한다 */}
      <button
        type="button"
        aria-describedby={titleId}
        className="flex h-button w-full items-center justify-center gap-2 rounded-xl bg-primary text-button font-bold text-on-color shadow-md transition-colors hover:bg-primary-dark focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-dark active:scale-[0.98]"
      >
        이 코스 보기
        <Icon name="arrow" className="size-6" />
      </button>
    </article>
  )
}
