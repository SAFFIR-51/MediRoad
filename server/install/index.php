<?php
/**
 * 최초 1회 설치: 테이블 생성 → 관리자 계정 → 기본 설정 → (선택) 예시 매물
 * 관리자가 이미 있거나 install/.lock 이 있으면 잠긴다. 설치 후 install 폴더는 삭제를 권장.
 */
require __DIR__ . '/../app/bootstrap.php';

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');
header('X-Frame-Options: DENY');

function h($s)
{
    return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8');
}

$lockFile = __DIR__ . '/.lock';
$state = 'form';
$message = '';
$errors = array();
$notes = array();

if (!mr_config()) {
    $state = 'no-config';
} else {
    try {
        db();
    } catch (Throwable $e) {
        $state = 'db-error';
        $message = $e->getMessage();
    }
}

if ($state === 'form') {
    if (is_file($lockFile)) {
        $state = 'locked';
    } else {
        try {
            if (db_count("SELECT COUNT(*) FROM users WHERE role = 'admin'") > 0) {
                $state = 'locked';
            }
        } catch (Throwable $e) {
            // 테이블이 아직 없음 → 설치 전
        }
    }
}

if ($state === 'form') {
    mr_session_start();
    if (empty($_SESSION['install_token'])) {
        $_SESSION['install_token'] = bin2hex(random_bytes(16));
    }
}

$old = array('email' => '', 'name' => '', 'seed' => true);

if ($state === 'form' && request_method() === 'POST') {
    $token = isset($_POST['token']) ? (string) $_POST['token'] : '';
    $email = normalize_email(isset($_POST['email']) ? $_POST['email'] : '');
    $name = trim(isset($_POST['name']) ? (string) $_POST['name'] : '');
    $password = isset($_POST['password']) ? (string) $_POST['password'] : '';
    $password2 = isset($_POST['password2']) ? (string) $_POST['password2'] : '';
    $seed = !empty($_POST['seed']);
    $old = array('email' => $email, 'name' => $name, 'seed' => $seed);

    if (!hash_equals($_SESSION['install_token'], $token)) {
        $errors[] = '페이지가 만료되었습니다. 새로고침 후 다시 시도해 주세요.';
    }
    if (!valid_email($email)) {
        $errors[] = '관리자 이메일을 정확히 입력해 주세요.';
    }
    if ($name === '' || mr_strlen($name) > 50) {
        $errors[] = '관리자 이름을 입력해 주세요.';
    }
    $pwProblem = password_problem($password);
    if ($pwProblem) {
        $errors[] = $pwProblem;
    } elseif ($password !== $password2) {
        $errors[] = '비밀번호 확인이 일치하지 않습니다.';
    }

    if (!$errors) {
        try {
            // 1) 테이블
            $sql = file_get_contents(MR_APP_DIR . '/schema.sql');
            $sql = preg_replace('/^\s*--.*$/m', '', $sql);
            foreach (array_filter(array_map('trim', explode(';', $sql))) as $stmt) {
                db()->exec($stmt);
            }

            // 2) 관리자
            $now = now_str();
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $exists = db_one('SELECT id FROM users WHERE email = ?', array($email));
            if ($exists) {
                db_exec("UPDATE users SET password_hash = ?, name = ?, role = 'admin' WHERE id = ?", array($hash, $name, (int) $exists['id']));
            } else {
                db_exec("INSERT INTO users (email, password_hash, name, phone, role, created_at) VALUES (?, ?, ?, '', 'admin', ?)", array($email, $hash, $name, $now));
            }

            // 3) 기본 설정
            db_exec("INSERT IGNORE INTO settings (skey, svalue) VALUES ('location_menu_visible', '1')");

            // 4) 예시 매물 (공인중개사법 필수값 검증을 그대로 통과한 것만 넣는다)
            if ($seed) {
                $seedFile = __DIR__ . '/seed-listings.json';
                $data = is_file($seedFile) ? json_decode(file_get_contents($seedFile), true) : null;
                $items = is_array($data) && isset($data['items']) && is_array($data['items']) ? $data['items'] : array();
                if (!$items) {
                    $notes[] = '예시 매물 파일(seed-listings.json)이 없어 예시 매물은 넣지 않았습니다.';
                }
                $added = 0;
                foreach ($items as $item) {
                    if (!is_array($item) || empty($item['code'])) {
                        continue;
                    }
                    list($row, $rowErrors) = listing_validate($item);
                    if ($rowErrors) {
                        $notes[] = '예시 매물 ' . $item['code'] . ' 건너뜀: ' . implode(' / ', $rowErrors);
                        continue;
                    }
                    if (db_count('SELECT COUNT(*) FROM listings WHERE code = ?', array($item['code'])) > 0) {
                        continue;
                    }
                    $created = !empty($item['date']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $item['date']) ? $item['date'] . ' 09:00:00' : $now;
                    $row['code'] = (string) $item['code'];
                    $row['is_sample'] = 1;
                    $row['closed_at'] = null;
                    $row['created_at'] = $created;
                    $row['updated_at'] = $created;
                    listing_insert_row($row);
                    $added++;
                }
                if ($items) {
                    $notes[] = '예시 매물 ' . $added . '건을 넣었습니다. 오픈 전에 관리자 > 매물 관리에서 "예시 매물 전체 삭제"로 지워 주세요.';
                }
            }

            if (@file_put_contents($lockFile, 'installed ' . $now . "\n") === false) {
                $notes[] = 'install/.lock 파일을 만들지 못했습니다. 관리자 계정이 있어 설치 화면은 잠기지만, install 폴더를 삭제해 주세요.';
            }
            unset($_SESSION['install_token']);
            $state = 'done';
        } catch (Throwable $e) {
            error_log('[mediroad install] ' . $e->getMessage());
            $errors[] = '설치 중 오류가 발생했습니다: ' . $e->getMessage();
        }
    }
}
?><!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>메디로드 설치</title>
<style>
  body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;background:#f3f5f8;color:#1b2430;}
  .box{max-width:520px;margin:60px auto;padding:36px 34px;background:#fff;border-radius:14px;box-shadow:0 10px 40px rgba(11,37,69,.08);}
  h1{margin:0 0 6px;font-size:22px;color:#0B2545;}
  p.sub{margin:0 0 26px;font-size:14px;color:#6b7684;line-height:1.6;}
  label{display:block;margin:16px 0 6px;font-size:13px;font-weight:600;}
  input[type=text],input[type=email],input[type=password]{width:100%;box-sizing:border-box;height:44px;padding:0 12px;border:1px solid #d5dbe3;border-radius:8px;font-size:15px;}
  .check{display:flex;gap:8px;align-items:flex-start;margin-top:18px;font-size:14px;line-height:1.5;}
  button{width:100%;height:48px;margin-top:26px;border:0;border-radius:8px;background:#1E4B7A;color:#fff;font-size:15px;font-weight:600;cursor:pointer;}
  button:hover{background:#0B2545;}
  .err{margin:0 0 18px;padding:12px 14px;border-radius:8px;background:#fdecea;color:#a2261b;font-size:14px;line-height:1.6;}
  .ok{margin:0 0 18px;padding:12px 14px;border-radius:8px;background:#e8f5ee;color:#1e6b3f;font-size:14px;line-height:1.6;}
  .note{font-size:13px;color:#6b7684;line-height:1.7;}
  code{background:#f0f3f7;padding:1px 6px;border-radius:4px;}
  a.btn{display:block;margin-top:12px;padding:13px;border-radius:8px;background:#1E4B7A;color:#fff;text-align:center;text-decoration:none;font-weight:600;}
  a.btn.line{background:#fff;color:#1E4B7A;border:1px solid #1E4B7A;}
</style>
</head>
<body>
<div class="box">
  <h1>메디로드 설치</h1>
<?php if ($state === 'no-config'): ?>
  <p class="sub">설정 파일이 없습니다.</p>
  <div class="err"><code>app/config.sample.php</code> 를 <code>app/config.php</code> 로 복사하고 DB 정보를 입력한 뒤 이 페이지를 새로고침해 주세요.</div>
<?php elseif ($state === 'db-error'): ?>
  <p class="sub">DB 에 연결하지 못했습니다.</p>
  <div class="err"><code>app/config.php</code> 의 DB 호스트·이름·아이디·비밀번호를 확인해 주세요.<br><small><?= h($message) ?></small></div>
<?php elseif ($state === 'locked'): ?>
  <p class="sub">이미 설치가 끝났습니다.</p>
  <div class="ok">보안을 위해 FTP 에서 <code>install</code> 폴더를 삭제해 주세요.</div>
  <a class="btn" href="/login/">로그인</a>
<?php elseif ($state === 'done'): ?>
  <p class="sub">설치가 끝났습니다.</p>
  <div class="ok">테이블과 관리자 계정을 만들었습니다.</div>
  <?php foreach ($notes as $n): ?><p class="note">· <?= h($n) ?></p><?php endforeach; ?>
  <p class="note"><b>보안을 위해 FTP 에서 <code>install</code> 폴더를 삭제해 주세요.</b></p>
  <a class="btn" href="/login/?next=%2Fadmin%2F">관리자 로그인</a>
  <a class="btn line" href="/">홈페이지</a>
<?php else: ?>
  <p class="sub">테이블을 만들고 관리자 계정을 등록합니다. 한 번만 실행됩니다.</p>
  <?php if ($errors): ?><div class="err"><?= implode('<br>', array_map('h', $errors)) ?></div><?php endif; ?>
  <form method="post" autocomplete="off">
    <input type="hidden" name="token" value="<?= h($_SESSION['install_token']) ?>">
    <label for="email">관리자 이메일 (로그인 아이디)</label>
    <input type="email" id="email" name="email" value="<?= h($old['email']) ?>" required>
    <label for="name">관리자 이름</label>
    <input type="text" id="name" name="name" value="<?= h($old['name']) ?>" required>
    <label for="password">비밀번호 (8자 이상)</label>
    <input type="password" id="password" name="password" required minlength="8">
    <label for="password2">비밀번호 확인</label>
    <input type="password" id="password2" name="password2" required minlength="8">
    <label class="check"><input type="checkbox" name="seed" value="1"<?= $old['seed'] ? ' checked' : '' ?>> 예시 매물 넣기 (화면 확인용, 오픈 전 관리자에서 일괄 삭제)</label>
    <button type="submit">설치하기</button>
  </form>
<?php endif; ?>
</div>
</body>
</html>
