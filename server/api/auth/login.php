<?php
/** 로그인 {email, password} */
require __DIR__ . '/../../app/api.php';
require_post();

$in = input_json();
$email = normalize_email(in_str($in, 'email', 191));
$password = (isset($in['password']) && is_string($in['password'])) ? $in['password'] : '';
$ip = client_ip();

if (login_blocked($ip)) {
    json_error('로그인 시도가 너무 많습니다. 10분 후 다시 시도해 주세요.', 429);
}

$errors = array();
if ($email === '') {
    $errors['email'] = '이메일을 입력해 주세요.';
}
if ($password === '') {
    $errors['password'] = '비밀번호를 입력해 주세요.';
}
if ($errors) {
    json_error('이메일과 비밀번호를 입력해 주세요.', 422, $errors);
}

$u = db_one('SELECT * FROM users WHERE email = ?', array($email));
// 없는 계정도 같은 시간이 걸리도록 더미 해시로 검증
$hash = $u ? $u['password_hash'] : '$2y$10$abcdefghijklmnopqrstuuJ8y3n0rJx4pD6YQkq7yJ6d8y5rj0zWe';
$valid = password_verify($password, $hash);
if (!$u || !$valid) {
    login_failed($ip, $email);
    json_error('이메일 또는 비밀번호가 올바르지 않습니다.', 401);
}

if (password_needs_rehash($u['password_hash'], PASSWORD_DEFAULT)) {
    db_exec('UPDATE users SET password_hash = ? WHERE id = ?', array(password_hash($password, PASSWORD_DEFAULT), (int) $u['id']));
}
login_succeeded($ip);
login_user($u);
json_ok(array('user' => user_public($u)));
