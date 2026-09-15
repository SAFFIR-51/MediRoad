<?php
/** 회원 인증: 세션에는 회원 id 만 두고, 요청마다 DB 에서 역할을 확인한다. */

function user_public(array $u)
{
    return array(
        'id' => (int) $u['id'],
        'email' => $u['email'],
        'name' => $u['name'],
        'phone' => $u['phone'],
        'role' => $u['role'],
    );
}

/** 현재 로그인 회원 (id,email,name,phone,role) 또는 null */
function current_user($refresh = false)
{
    static $cache = false;
    if ($cache !== false && !$refresh) {
        return $cache;
    }
    $cache = null;
    if (!isset($_SESSION) && !mr_session_resume()) {
        return null;
    }
    $uid = isset($_SESSION['uid']) ? (int) $_SESSION['uid'] : 0;
    if ($uid > 0) {
        $u = db_one('SELECT id, email, name, phone, role FROM users WHERE id = ?', array($uid));
        if ($u) {
            $cache = $u;
        } elseif (session_status() === PHP_SESSION_ACTIVE) {
            unset($_SESSION['uid']);
        }
    }
    return $cache;
}

function require_member()
{
    $u = current_user();
    if (!$u) {
        json_error('로그인이 필요합니다.', 401);
    }
    return $u;
}

function require_admin()
{
    $u = current_user();
    if (!$u) {
        json_error('로그인이 필요합니다.', 401);
    }
    if ($u['role'] !== 'admin') {
        json_error('관리자만 접근할 수 있습니다.', 403);
    }
    return $u;
}

function login_user(array $u)
{
    mr_session_start();
    session_regenerate_id(true);
    $_SESSION['uid'] = (int) $u['id'];
    $_SESSION['login_at'] = time();
    db_exec('UPDATE users SET last_login_at = ? WHERE id = ?', array(now_str(), (int) $u['id']));
    current_user(true);
}

function logout_user()
{
    if (!mr_session_resume()) {
        return;
    }
    $_SESSION = array();
    setcookie(session_name(), '', array(
        'expires' => time() - 3600,
        'path' => '/',
        'secure' => is_https(),
        'httponly' => true,
        'samesite' => 'Lax',
    ));
    session_destroy();
}

function normalize_email($email)
{
    return strtolower(trim((string) $email));
}

function valid_email($email)
{
    return $email !== '' && strlen($email) <= 191 && filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/** 비밀번호 규칙 위반 메시지 또는 null (bcrypt 는 72바이트까지만 사용) */
function password_problem($pw)
{
    if (!is_string($pw) || strlen($pw) < 8) {
        return '비밀번호는 8자 이상으로 입력해 주세요.';
    }
    if (strlen($pw) > 72) {
        return '비밀번호는 72자(영문 기준) 이하로 입력해 주세요.';
    }
    return null;
}

/** 로그인 실패 제한: 같은 IP 에서 10분 안에 10회 실패하면 차단 */
function login_blocked($ip)
{
    return db_count('SELECT COUNT(*) FROM login_attempts WHERE ip = ? AND attempted_at > ?', array($ip, now_str(-600))) >= 10;
}

function login_failed($ip, $email)
{
    db_exec('INSERT INTO login_attempts (ip, email, attempted_at) VALUES (?, ?, ?)', array($ip, substr($email, 0, 191), now_str()));
    if (mt_rand(1, 20) === 1) {
        db_exec('DELETE FROM login_attempts WHERE attempted_at < ?', array(now_str(-86400)));
    }
}

function login_succeeded($ip)
{
    db_exec('DELETE FROM login_attempts WHERE ip = ?', array($ip));
}

/**
 * 보안 기록 정리 (개인정보처리방침: 재설정 요청·로그인 시도 기록 최대 30일 보관).
 * api.php 가 요청 일부에서 호출하므로 로그인 실패가 다시 없더라도 오래된 기록이 남지 않는다.
 */
function purge_security_logs()
{
    db_exec('DELETE FROM login_attempts WHERE attempted_at < ?', array(now_str(-86400)));
    db_exec('DELETE FROM password_resets WHERE created_at < ?', array(now_str(-86400 * 30)));
}
