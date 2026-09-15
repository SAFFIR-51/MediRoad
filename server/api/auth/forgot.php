<?php
/**
 * 비밀번호 재설정 메일 {email}
 * 가입 여부와 관계없이 같은 응답을 준다. 토큰은 1시간 유효, DB 에는 sha256 해시만 저장.
 */
require __DIR__ . '/../../app/api.php';
require_post();

$in = input_json();
$email = normalize_email(in_str($in, 'email', 191));
if (!valid_email($email)) {
    json_error('올바른 이메일 주소를 입력해 주세요.', 422, array('email' => '올바른 이메일 주소를 입력해 주세요.'));
}

$u = db_one('SELECT id, email, name FROM users WHERE email = ?', array($email));
if ($u) {
    $recent = db_count('SELECT COUNT(*) FROM password_resets WHERE user_id = ? AND created_at > ?', array((int) $u['id'], now_str(-600)));
    if ($recent < 3) {
        $token = bin2hex(random_bytes(32));
        db_exec(
            'INSERT INTO password_resets (user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?)',
            array((int) $u['id'], hash('sha256', $token), now_str(3600), now_str())
        );
        $url = rtrim((string) mr_cfg('site_url', ''), '/') . '/reset-password/?token=' . $token;
        $body = $u['name'] . "님, 안녕하세요.\n\n"
            . "메디로드 비밀번호 재설정 요청을 받았습니다.\n"
            . "아래 링크에서 1시간 안에 새 비밀번호를 설정해 주세요.\n\n"
            . $url . "\n\n"
            . "본인이 요청하지 않았다면 이 메일을 무시하셔도 됩니다. 비밀번호는 바뀌지 않습니다.\n\n"
            . "메디로드";
        send_mail($u['email'], '[메디로드] 비밀번호 재설정 안내', $body);
    }
}
json_ok();
