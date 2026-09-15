<?php
/**
 * 메일 발송: PHP mail() (카페24 웹호스팅 지원). 텍스트 메일, UTF-8 base64.
 * config mail_mode = 'log' 이면 보내지 않고 app/storage/mail.log 에 기록한다 (로컬 테스트).
 */

function mr_mime_header($s)
{
    return '=?UTF-8?B?' . base64_encode($s) . '?=';
}

function send_mail($to, $subject, $body)
{
    $mode = mr_cfg('mail_mode', 'mail');
    $from = (string) mr_cfg('mail_from', 'no-reply@localhost');
    $fromName = (string) mr_cfg('mail_from_name', '메디로드');

    if ($mode === 'log') {
        $line = '[' . now_str() . "] TO: {$to}\nSUBJECT: {$subject}\n{$body}\n" . str_repeat('-', 60) . "\n";
        return @file_put_contents(MR_APP_DIR . '/storage/mail.log', $line, FILE_APPEND | LOCK_EX) !== false;
    }

    if (preg_match('/[\r\n]/', $to . $from . $fromName) || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
        return false;
    }
    $headers = 'From: ' . mr_mime_header($fromName) . ' <' . $from . ">\r\n"
        . 'Reply-To: ' . $from . "\r\n"
        . "MIME-Version: 1.0\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\n"
        . "Content-Transfer-Encoding: base64\r\n"
        . 'X-Mailer: MediRoad';
    $encodedSubject = mr_mime_header($subject);
    $encodedBody = chunk_split(base64_encode($body));

    $ok = @mail($to, $encodedSubject, $encodedBody, $headers, '-f' . $from);
    if (!$ok) {
        $ok = @mail($to, $encodedSubject, $encodedBody, $headers);
    }
    if (!$ok) {
        error_log('[mediroad mail] 발송 실패: ' . $to . ' / ' . $subject);
    }
    return $ok;
}
