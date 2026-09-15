<?php
/** 상담 문의 */

const INQUIRY_STATUSES = array('new', 'in_progress', 'done');

/** API 필드(camelCase) → DB 컬럼, 최대 길이 */
function inquiry_fields()
{
    return array(
        'name' => array('name', 50),
        'phone' => array('phone', 30),
        'email' => array('email', 191),
        'department' => array('department', 50),
        'region' => array('region', 100),
        'openTiming' => array('open_timing', 30),
        'budget' => array('budget', 30),
        'deposit' => array('deposit', 30),
        'rent' => array('rent', 30),
        'facilityCost' => array('facility_cost', 30),
        'area' => array('area', 30),
        'facility' => array('facility', 10),
        'consultType' => array('consult_type', 30),
        'message' => array('message', 3000),
    );
}

function inquiry_from_row(array $r)
{
    $out = array('id' => (int) $r['id']);
    foreach (inquiry_fields() as $key => $f) {
        $out[$key] = (string) $r[$f[0]];
    }
    $out['status'] = $r['status'];
    $out['memo'] = (string) $r['memo'];
    $out['createdAt'] = $r['created_at'];
    $out['updatedAt'] = $r['updated_at'];
    return $out;
}

function inquiry_status_label($status)
{
    $labels = array('new' => '신규', 'in_progress' => '상담중', 'done' => '완료');
    return isset($labels[$status]) ? $labels[$status] : $status;
}

/** 새 문의 알림 메일 (config notify_email 이 있을 때만) */
function inquiry_notify(array $item)
{
    $to = trim((string) mr_cfg('notify_email', ''));
    if ($to === '') {
        return;
    }
    $labels = array(
        'name' => '성함', 'phone' => '연락처', 'email' => '이메일', 'department' => '진료과목', 'region' => '희망 개원 지역',
        'openTiming' => '개원 예정 시기', 'budget' => '자금 규모', 'deposit' => '보증금', 'rent' => '임대료',
        'facilityCost' => '시설비', 'area' => '예상 연면적', 'facility' => '시설유무', 'consultType' => '상담유형', 'message' => '문의내용',
    );
    $lines = array('메디로드 홈페이지로 새 상담 문의가 접수되었습니다.', '', '접수일시: ' . $item['createdAt']);
    foreach ($labels as $k => $label) {
        if (isset($item[$k]) && $item[$k] !== '') {
            $lines[] = $label . ': ' . $item[$k];
        }
    }
    $lines[] = '';
    $lines[] = '관리자 페이지: ' . rtrim((string) mr_cfg('site_url', ''), '/') . '/admin/inquiries/view/?id=' . $item['id'];
    send_mail($to, '[메디로드] 새 상담 문의 - ' . $item['name'], implode("\n", $lines));
}
