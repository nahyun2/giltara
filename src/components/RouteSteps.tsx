import type { TransitRoute } from '../types/route'
import Icon from './Icon'

type Props = {
  route: TransitRoute
}

/** 저장된 대중교통 경로를 단계별로 보여준다 (#38) */
export default function RouteSteps({ route }: Props) {
  if (route.kind === 'walk') {
    return (
      <p className="flex items-center gap-2 text-body text-text">
        <Icon name="walk" className="size-6 shrink-0 text-primary" />
        걸어서 약 {route.totalMinutes}분 ({route.meters}m)
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-caption text-text-sub">
        약 {route.totalMinutes}분 · {route.fare.toLocaleString()}원(1명)
        {route.transfers > 0 ? ` · ${route.transfers}번 갈아타요` : ' · 갈아타지 않아요'}
      </p>
      <ol className="flex flex-col gap-2">
        {route.steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-chip text-primary">
              <Icon name={step.kind === 'walk' ? 'walk' : step.kind === 'bus' ? 'bus' : 'subway'} className="size-5" />
            </span>
            {step.kind === 'walk' ? (
              <p className="text-body text-text">
                걸어서 {step.minutes}분 <span className="text-text-sub">({step.meters}m)</span>
              </p>
            ) : (
              <div className="flex flex-col gap-0.5">
                <p className="text-body font-bold text-text">
                  {step.kind === 'bus' ? '버스' : '지하철'} {step.lines.join(', ')}
                </p>
                <p className="text-body text-text">
                  <strong>{step.from}</strong>에서 타서 <strong>{step.to}</strong>에서 내려요
                </p>
                <p className="text-caption text-text-sub">
                  {step.stations}정거장 · {step.minutes}분
                </p>
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
