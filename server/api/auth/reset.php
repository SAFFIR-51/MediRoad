<?php
/** 새 비밀번호 저장 {token, password} */
require __DIR__ . '/../../app/api.php';
require_post();

$in = input_json();
$token = in_str($in, 'token', 128);
$password = (isset($in['password']) && is_string($in['password'])) ? $in['password'] : '';

if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
    json_error('재설정 링크가 올바르지 않습니다. 비밀번호 찾기를 다시 진행해 주세요.', 400);
}
$pwProblem = password_problem($password);
if ($pwProblem) {
    json_error($pwProblem, 422, array('password' => $pwProblem));
}

$row = db_one(
    'SELECT id, user_id FROM password_resets WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?',
    array(hash('sha256', $token), now_str())
);
if (!$row) {
    json_error('재설정 링크가 만료되었거나 이미 사용되었습니다. 비밀번호 찾기를 다시 진행해 주세요.', 400);
}

$pdo = db();
$pdo->beginTransaction();
db_exec('UPDATE users SET password_hash = ? WHERE id = ?', array(password_hash($password, PASSWORD_DEFAULT), (int) $row['user_id']));
// 이 토큰과 같은 회원의 남은 토큰을 모두 사용 처리
db_exec('UPDATE password_resets SET used_at = ? WHERE user_id = ? AND used_at IS NULL', array(now_str(), (int) $row['user_id']));
$pdo->commit();

json_ok();
