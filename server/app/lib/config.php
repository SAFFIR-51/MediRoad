<?php
/** 설정 로드: app/config.php → (없으면) 환경변수 기반 config.sample.php (로컬 docker 전용) */

function mr_config()
{
    static $loaded = false;
    static $cfg = null;
    if ($loaded) {
        return $cfg;
    }
    $loaded = true;
    $file = MR_APP_DIR . '/config.php';
    if (is_file($file)) {
        $cfg = require $file;
    } elseif (getenv('MR_DB_HOST')) {
        $cfg = require MR_APP_DIR . '/config.sample.php';
    }
    if (!is_array($cfg)) {
        $cfg = null;
    }
    return $cfg;
}

/** 점 표기 설정값: mr_cfg('db.host') */
function mr_cfg($key, $default = null)
{
    $cfg = mr_config();
    if (!$cfg) {
        return $default;
    }
    $cur = $cfg;
    foreach (explode('.', $key) as $part) {
        if (!is_array($cur) || !array_key_exists($part, $cur)) {
            return $default;
        }
        $cur = $cur[$part];
    }
    return $cur;
}
