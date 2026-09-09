import { Fragment } from "react";

/** 줄 배열을 <br> 로 이어 붙인다. 빈 문자열은 모바일 전용 줄바꿈(br.m) 두 개로 표시 (원본 문단 간격). */
export function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((l, i) => (
        <Fragment key={i}>
          {l === "" ? <><br className="m" /><br className="m" /></> : l}
          {i < lines.length - 1 && l !== "" ? <br /> : null}
        </Fragment>
      ))}
    </>
  );
}
