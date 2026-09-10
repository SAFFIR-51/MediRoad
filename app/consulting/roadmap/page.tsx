import { redirect } from "next/navigation";

/** 개원 로드맵은 병·의원 개원 컨설팅 페이지 안으로 들어갔다. 옛 주소는 그쪽으로 보낸다. */
export default function RoadmapRedirect() {
  redirect("/consulting/opening#roadmap");
}
