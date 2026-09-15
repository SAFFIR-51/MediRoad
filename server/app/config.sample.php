<?php
/**
 * 메디로드 서버 설정 샘플
 *
 * 카페24: 이 파일을 같은 폴더에 config.php 로 복사한 뒤 아래 값을 직접 입력하세요.
 *        (getenv(...) 부분은 지우고 따옴표 안에 값을 넣으면 됩니다.)
 * 로컬 docker: config.php 가 없으면 이 파일을 환경변수(MR_*)로 읽습니다.
 */
return array(
    // 카페24 호스팅 관리 화면의 DB 정보 (보통 host 는 localhost, DB 이름·아이디는 FTP 아이디와 같음)
    'db' => array(
        'host' => getenv('MR_DB_HOST') ?: 'localhost',
        'port' => getenv('MR_DB_PORT') ?: '3306',
        'name' => getenv('MR_DB_NAME') ?: 'DB이름',
        'user' => getenv('MR_DB_USER') ?: 'DB아이디',
        'pass' => getenv('MR_DB_PASS') ?: 'DB비밀번호',
    ),

    // 사이트 주소 (비밀번호 재설정 메일 링크에 사용, 끝에 / 없이)
    'site_url' => getenv('MR_SITE_URL') ?: 'https://www.mediroad.co.kr',

    // 메일: 'mail' = PHP mail() 로 발송, 'log' = 보내지 않고 app/storage/mail.log 에 기록
    'mail_mode' => getenv('MR_MAIL_MODE') ?: 'mail',
    'mail_from' => getenv('MR_MAIL_FROM') ?: 'no-reply@mediroad.co.kr',
    'mail_from_name' => '메디로드',

    // 새 상담 문의 알림을 받을 주소 (비우면 알림 메일을 보내지 않음)
    'notify_email' => getenv('MR_NOTIFY_EMAIL') ?: '',
);
