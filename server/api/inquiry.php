<?php
/** 상담 신청 접수 (비회원 가능). website 는 허니팟 — 값이 있으면 저장하지 않고 성공 응답. */
require __DIR__ . '/../app/api.php';
require_post();

$in = input_json();
if (in_str($in, 'website', 200) !== '') {
    json_ok();
}

$values = array();
foreach (inquiry_fields() as $key => $f) {
    $values[$key] = in_str($in, $key, $f[1]);
}
$values['email'] = normalize_email($values['email']);

$errors = array();
if ($values['name'] === '') {
    $errors['name'] = '성함을 입력해 주세요.';
}
if (!preg_match('/^[0-9+\-\s()]{9,20}$/', $values['phone'])) {
    $errors['phone'] = '연락처를 정확히 입력해 주세요.';
}
if (!valid_email($values['email'])) {
    $errors['email'] = '이메일 주소를 정확히 입력해 주세요.';
}
if ($values['department'] === '') {
    $errors['department'] = '진료과목을 입력해 주세요.';
}
if ($values['region'] === '') {
    $errors['region'] = '희망 개원 지역을 입력해 주세요.';
}
if ($values['openTiming'] === '') {
    $errors['openTiming'] = '개원 예정 시기를 선택해 주세요.';
}
if ($values['budget'] === '') {
    $errors['budget'] = '자금 규모를 선택해 주세요.';
}
if (!in_bool($in, 'agree')) {
    $errors['agree'] = '개인정보 수집 및 이용에 동의해 주세요.';
}
if ($errors) {
    $first = reset($errors);
    json_error($first, 422, $errors);
}

$ip = client_ip();
if (db_count('SELECT COUNT(*) FROM inquiries WHERE ip = ? AND created_at > ?', array($ip, now_str(-600))) >= 5) {
    json_error('짧은 시간에 너무 많이 신청하셨습니다. 잠시 후 다시 시도하거나 전화로 문의해 주세요.', 429);
}

$now = now_str();
$cols = array();
$params = array();
foreach (inquiry_fields() as $key => $f) {
    $cols[] = $f[0];
    $params[] = $values[$key];
}
$cols = array_merge($cols, array('status', 'memo', 'ip', 'created_at', 'updated_at'));
$params = array_merge($params, array('new', '', $ip, $now, $now));
db_exec(
    'INSERT INTO inquiries (' . implode(', ', $cols) . ') VALUES (' . implode(', ', array_fill(0, count($cols), '?')) . ')',
    $params
);
$id = (int) db()->lastInsertId();

try {
    inquiry_notify(array('id' => $id, 'createdAt' => $now) + $values);
} catch (Throwable $e) {
    error_log('[mediroad inquiry notify] ' . $e->getMessage());
}

json_ok();
