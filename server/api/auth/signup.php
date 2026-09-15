<?php
/** 회원가입 {email, password, name, phone, agree} → 가입 즉시 로그인 */
require __DIR__ . '/../../app/api.php';
require_post();

$in = input_json();
$email = normalize_email(in_str($in, 'email', 191));
$password = (isset($in['password']) && is_string($in['password'])) ? $in['password'] : '';
$name = in_str($in, 'name', 50);
$phone = in_str($in, 'phone', 30);

$errors = array();
if (!valid_email($email)) {
    $errors['email'] = '올바른 이메일 주소를 입력해 주세요.';
}
$pwProblem = password_problem($password);
if ($pwProblem) {
    $errors['password'] = $pwProblem;
}
if ($name === '') {
    $errors['name'] = '이름을 입력해 주세요.';
}
if (!preg_match('/^[0-9+\-\s()]{9,20}$/', $phone)) {
    $errors['phone'] = '연락처를 정확히 입력해 주세요.';
}
if (!in_bool($in, 'agree')) {
    $errors['agree'] = '개인정보 수집·이용에 동의해 주세요.';
}
if (!isset($errors['email']) && db_count('SELECT COUNT(*) FROM users WHERE email = ?', array($email)) > 0) {
    $errors['email'] = '이미 가입된 이메일입니다.';
}
if ($errors) {
    json_error('입력한 내용을 확인해 주세요.', 422, $errors);
}

try {
    db_exec(
        'INSERT INTO users (email, password_hash, name, phone, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        array($email, password_hash($password, PASSWORD_DEFAULT), $name, $phone, 'member', now_str())
    );
} catch (PDOException $e) {
    if (db_is_duplicate($e)) {
        json_error('입력한 내용을 확인해 주세요.', 422, array('email' => '이미 가입된 이메일입니다.'));
    }
    throw $e;
}

$u = db_one('SELECT id, email, name, phone, role FROM users WHERE email = ?', array($email));
login_user($u);
json_ok(array('user' => user_public($u)));
