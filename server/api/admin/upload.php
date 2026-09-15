<?php
/**
 * 매물 사진 업로드 (multipart: file)
 * jpg · png · webp, 15MB 이하 → GD 로 긴 변 1600px 리사이즈 + JPEG(85) 재인코딩(EXIF·숨은 데이터 제거)
 * 저장: uploads/listings/YYYY/MM/<무작위>.jpg
 */
require __DIR__ . '/../../app/api.php';
require_post();
require_admin();

if (!function_exists('imagecreatetruecolor')) {
    json_error('서버에 GD 확장이 없어 사진을 처리할 수 없습니다. 호스팅 PHP 설정을 확인해 주세요.', 500);
}
@ini_set('memory_limit', '256M');

if (empty($_FILES['file']) || !is_array($_FILES['file'])) {
    json_error('업로드할 사진이 없습니다. 사진이 너무 크면 서버 한도 때문에 전송되지 않을 수 있습니다.', 400);
}
$f = $_FILES['file'];
if (is_array($f['error'])) {
    json_error('사진은 한 장씩 올려 주세요.', 400);
}
if ($f['error'] === UPLOAD_ERR_INI_SIZE || $f['error'] === UPLOAD_ERR_FORM_SIZE) {
    json_error('사진 용량이 서버 업로드 한도를 넘었습니다.', 413);
}
if ($f['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($f['tmp_name'])) {
    json_error('사진 업로드에 실패했습니다. 다시 시도해 주세요.', 400);
}
if ($f['size'] > 15 * 1024 * 1024) {
    json_error('15MB 이하 사진만 올릴 수 있습니다.', 413);
}

$tmp = $f['tmp_name'];
$info = @getimagesize($tmp);
if (!$info) {
    json_error('이미지 파일이 아닙니다.', 422);
}
$mime = $info['mime'];
if (class_exists('finfo')) {
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $detected = $finfo->file($tmp);
    if ($detected) {
        $mime = $detected;
    }
}
$allowed = array('image/jpeg', 'image/png', 'image/webp');
if (!in_array($mime, $allowed, true) || !in_array($info['mime'], $allowed, true)) {
    json_error('JPG · PNG · WEBP 사진만 올릴 수 있습니다.', 422);
}
$w = (int) $info[0];
$h = (int) $info[1];
if ($w < 1 || $h < 1 || $w * $h > 60000000) {
    json_error('사진 해상도가 너무 큽니다. 크기를 줄여 다시 올려 주세요.', 422);
}

if ($mime === 'image/jpeg') {
    $src = @imagecreatefromjpeg($tmp);
} elseif ($mime === 'image/png') {
    $src = @imagecreatefrompng($tmp);
} else {
    if (!function_exists('imagecreatefromwebp')) {
        json_error('서버가 WEBP 사진을 지원하지 않습니다. JPG 로 올려 주세요.', 422);
    }
    $src = @imagecreatefromwebp($tmp);
}
if (!$src) {
    json_error('사진을 읽을 수 없습니다. 다른 사진으로 시도해 주세요.', 422);
}

// 휴대폰 사진 회전 정보(EXIF Orientation) 반영
if ($mime === 'image/jpeg' && function_exists('exif_read_data')) {
    $exif = @exif_read_data($tmp);
    $orientation = is_array($exif) && isset($exif['Orientation']) ? (int) $exif['Orientation'] : 1;
    $angle = array(3 => 180, 6 => -90, 8 => 90);
    if (isset($angle[$orientation])) {
        $rotated = imagerotate($src, $angle[$orientation], 0);
        if ($rotated) {
            imagedestroy($src);
            $src = $rotated;
            $w = imagesx($src);
            $h = imagesy($src);
        }
    }
}

$max = 1600;
$scale = min(1, $max / max($w, $h));
$nw = max(1, (int) round($w * $scale));
$nh = max(1, (int) round($h * $scale));
$dst = imagecreatetruecolor($nw, $nh);
imagefill($dst, 0, 0, imagecolorallocate($dst, 255, 255, 255));
imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);
imagedestroy($src);

$sub = 'uploads/listings/' . date('Y') . '/' . date('m');
$dir = MR_WEB_ROOT . '/' . $sub;
if (!is_dir($dir)) {
    @mkdir($dir, 0755, true);
}
if (!is_dir($dir) || !is_writable($dir)) {
    imagedestroy($dst);
    json_error('업로드 폴더에 쓸 수 없습니다. uploads 폴더 권한을 확인해 주세요.', 500);
}
$name = bin2hex(random_bytes(8)) . '.jpg';
$ok = imagejpeg($dst, $dir . '/' . $name, 85);
imagedestroy($dst);
if (!$ok) {
    json_error('사진 저장에 실패했습니다.', 500);
}

json_ok(array('path' => '/' . $sub . '/' . $name));
