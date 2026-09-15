<?php
/**
 * 매물 (공인중개사법 표시·광고 명시사항)
 * 필수: 소재지·면적·가격·용도·거래형태·층수·사용승인일·방향·주차·관리비·입주가능일.
 * 가격은 만원 단위 정수로만 저장하므로 "협의"만 적는 것은 구조적으로 불가능하다 (price_note 는 보조 문구).
 */

const LISTING_DEAL_TYPES = array('임대', '분양', '매매');
const LISTING_STATUSES = array('open', 'closed', 'hidden');

/** JSON 배열 문자열 → 문자열 배열 */
function json_list($s)
{
    $a = json_decode((string) $s, true);
    if (!is_array($a)) {
        return array();
    }
    $out = array();
    foreach ($a as $v) {
        if (is_string($v) && $v !== '') {
            $out[] = $v;
        }
    }
    return $out;
}

function nullable_int($v)
{
    return $v === null ? null : (int) $v;
}

function nullable_float($v)
{
    return $v === null ? null : (float) $v;
}

/** DB 행 → API 출력 (camelCase) */
function listing_from_row(array $r)
{
    return array(
        'id' => (int) $r['id'],
        'code' => $r['code'],
        'dealType' => $r['deal_type'],
        'category' => $r['category'],
        'title' => $r['title'],
        'region' => $r['region'],
        'address' => $r['address'],
        'depositManwon' => nullable_int($r['deposit_manwon']),
        'rentManwon' => nullable_int($r['rent_manwon']),
        'salePriceManwon' => nullable_int($r['sale_price_manwon']),
        'priceNote' => (string) $r['price_note'],
        'areaM2' => (float) $r['area_m2'],
        'floorCurrent' => $r['floor_current'],
        'floorTotal' => (int) $r['floor_total'],
        'useType' => $r['use_type'],
        'approvalDate' => $r['approval_date'],
        'direction' => $r['direction'],
        'parking' => (int) $r['parking'],
        'maintenanceManwon' => (int) $r['maintenance_manwon'],
        'moveIn' => $r['move_in'],
        'violation' => (bool) (int) $r['violation'],
        'features' => json_list($r['features']),
        'description' => (string) $r['description'],
        'images' => json_list($r['images']),
        'lat' => nullable_float($r['lat']),
        'lng' => nullable_float($r['lng']),
        'status' => $r['status'],
        'isSample' => (bool) (int) $r['is_sample'],
        'closedAt' => $r['closed_at'],
        'createdAt' => $r['created_at'],
        'updatedAt' => $r['updated_at'],
    );
}

/**
 * 입력(camelCase) 검증 → array(DB 컬럼 배열, 필드별 오류)
 * code · is_sample · closed_at · created_at · updated_at 은 여기서 다루지 않는다.
 */
function listing_validate(array $in)
{
    $e = array();
    $d = array();

    $dealType = in_str($in, 'dealType', 10);
    if (!in_array($dealType, LISTING_DEAL_TYPES, true)) {
        $e['dealType'] = '거래형태(임대·분양·매매)를 선택해 주세요.';
    }
    $d['deal_type'] = $dealType;

    $texts = array(
        'category' => array('category', 30, '업종을 입력해 주세요. (예: 의원, 치과, 약국)'),
        'title' => array('title', 120, '매물 제목을 입력해 주세요.'),
        'region' => array('region', 60, '지역을 입력해 주세요. (예: 서울 강서구)'),
        'address' => array('address', 200, '소재지를 입력해 주세요.'),
        'use_type' => array('useType', 60, '건축물 용도를 입력해 주세요. (예: 제1종 근린생활시설)'),
        'direction' => array('direction', 40, '방향을 입력해 주세요. (예: 남향, 주출입구 기준)'),
        'move_in' => array('moveIn', 60, '입주가능일을 입력해 주세요. (예: 즉시 입주, 2026.11 이후)'),
        'floor_current' => array('floorCurrent', 10, '해당 층을 입력해 주세요. (예: 3, B1, 2~3)'),
    );
    foreach ($texts as $col => $t) {
        $v = in_str($in, $t[0], $t[1]);
        if ($v === '') {
            $e[$t[0]] = $t[2];
        }
        $d[$col] = $v;
    }

    $area = in_float($in, 'areaM2');
    if ($area === null || $area === false || $area <= 0 || $area > 999999) {
        $e['areaM2'] = '면적을 ㎡ 단위 숫자로 입력해 주세요.';
        $d['area_m2'] = 0;
    } else {
        $d['area_m2'] = round($area, 2);
    }

    $floorTotal = in_int($in, 'floorTotal');
    if (!is_int($floorTotal) || $floorTotal < 1 || $floorTotal > 300) {
        $e['floorTotal'] = '건물 전체 층수를 숫자로 입력해 주세요.';
        $d['floor_total'] = 0;
    } else {
        $d['floor_total'] = $floorTotal;
    }

    $approval = in_str($in, 'approvalDate', 10);
    if (!preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $approval, $m) || !checkdate((int) $m[2], (int) $m[3], (int) $m[1])) {
        $e['approvalDate'] = '사용승인일을 날짜(YYYY-MM-DD)로 입력해 주세요.';
        $d['approval_date'] = null;
    } else {
        $d['approval_date'] = $approval;
    }

    $parking = in_int($in, 'parking');
    if (!is_int($parking) || $parking < 0) {
        $e['parking'] = '주차대수를 숫자로 입력해 주세요. (없으면 0)';
        $d['parking'] = 0;
    } else {
        $d['parking'] = $parking;
    }

    $maintenance = in_int($in, 'maintenanceManwon');
    if (!is_int($maintenance) || $maintenance < 0) {
        $e['maintenanceManwon'] = '관리비를 만원 단위 숫자로 입력해 주세요. (없으면 0)';
        $d['maintenance_manwon'] = 0;
    } else {
        $d['maintenance_manwon'] = $maintenance;
    }

    // 가격 (만원 단위 정수)
    $numericMsg = "만원 단위 숫자로 입력해 주세요. '협의'만 적을 수는 없습니다.";
    $deposit = in_int($in, 'depositManwon');
    $rent = in_int($in, 'rentManwon');
    $sale = in_int($in, 'salePriceManwon');
    $labels = array('depositManwon' => '보증금은 ', 'rentManwon' => '월세는 ', 'salePriceManwon' => '가격은 ');
    foreach (array('depositManwon' => $deposit, 'rentManwon' => $rent, 'salePriceManwon' => $sale) as $k => $v) {
        if ($v === false || (is_int($v) && $v < 0)) {
            $e[$k] = $labels[$k] . $numericMsg;
        }
    }
    if ($dealType === '임대') {
        if ($deposit === null) {
            $e['depositManwon'] = '임대 매물은 보증금을 ' . $numericMsg;
        }
        if ($rent === null) {
            $e['rentManwon'] = '임대 매물은 월세를 ' . $numericMsg;
        } elseif ($rent === 0) {
            $e['rentManwon'] = '월세는 0보다 커야 합니다.';
        }
    } elseif ($dealType === '분양' || $dealType === '매매') {
        $name = $dealType === '분양' ? '분양가를 ' : '매매가를 ';
        if ($sale === null) {
            $e['salePriceManwon'] = $dealType . ' 매물은 ' . $name . $numericMsg;
        } elseif ($sale === 0) {
            $e['salePriceManwon'] = ($dealType === '분양' ? '분양가는' : '매매가는') . ' 0보다 커야 합니다.';
        }
    }
    $d['deposit_manwon'] = is_int($deposit) ? $deposit : null;
    $d['rent_manwon'] = is_int($rent) ? $rent : null;
    $d['sale_price_manwon'] = is_int($sale) ? $sale : null;
    $d['price_note'] = in_str($in, 'priceNote', 100);

    $d['violation'] = in_bool($in, 'violation') ? 1 : 0;

    // 특징 태그
    $featuresIn = isset($in['features']) ? $in['features'] : array();
    if (is_string($featuresIn)) {
        $featuresIn = explode(',', $featuresIn);
    }
    $features = array();
    if (is_array($featuresIn)) {
        foreach ($featuresIn as $f) {
            if (!is_string($f)) {
                continue;
            }
            $f = trim($f);
            if ($f === '') {
                continue;
            }
            if (mr_strlen($f) > 30) {
                $f = mr_substr($f, 0, 30);
            }
            if (!in_array($f, $features, true)) {
                $features[] = $f;
            }
            if (count($features) >= 20) {
                break;
            }
        }
    }
    $d['features'] = json_encode($features, JSON_UNESCAPED_UNICODE);

    $d['description'] = in_str($in, 'description', 5000);

    // 사진 경로: 업로드 사진(/uploads/listings/…) 또는 데모 이미지(/images/…) 만 허용
    $imagesIn = isset($in['images']) ? $in['images'] : array();
    $images = array();
    if (!is_array($imagesIn)) {
        $e['images'] = '사진 목록 형식이 올바르지 않습니다.';
    } else {
        foreach ($imagesIn as $p) {
            if (!is_string($p) || strpos($p, '..') !== false || !preg_match('#^/(uploads/listings|images)/[A-Za-z0-9._/%-]+$#', $p)) {
                $e['images'] = '사진 경로가 올바르지 않습니다. 다시 업로드해 주세요.';
                continue;
            }
            if (!in_array($p, $images, true)) {
                $images[] = $p;
            }
        }
        if (count($images) > 30) {
            $e['images'] = '사진은 30장까지 올릴 수 있습니다.';
        }
    }
    $d['images'] = json_encode($images, JSON_UNESCAPED_SLASHES);

    foreach (array('lat' => array(-90, 90), 'lng' => array(-180, 180)) as $k => $range) {
        $v = in_float($in, $k);
        if ($v === false || ($v !== null && ($v < $range[0] || $v > $range[1]))) {
            $e[$k] = '좌표 형식이 올바르지 않습니다.';
            $v = null;
        }
        $d[$k] = $v;
    }

    $status = in_str($in, 'status', 10);
    if ($status === '') {
        $status = 'open';
    }
    if (!in_array($status, LISTING_STATUSES, true)) {
        $e['status'] = '노출 상태가 올바르지 않습니다.';
        $status = 'open';
    }
    $d['status'] = $status;

    $sort = in_int($in, 'sortOrder');
    $d['sort_order'] = is_int($sort) ? $sort : 0;

    return array($d, $e);
}

/** 다음 매물 코드: 임대·분양 L-YYYY-NNN, 매매 S-YYYY-NNN */
function listing_next_code($dealType)
{
    $prefix = ($dealType === '매매' ? 'S' : 'L') . '-' . date('Y') . '-';
    $max = db_count(
        'SELECT COALESCE(MAX(CAST(SUBSTRING(code, ?) AS UNSIGNED)), 0) FROM listings WHERE code LIKE ?',
        array(strlen($prefix) + 1, $prefix . '%')
    );
    return $prefix . str_pad((string) ($max + 1), 3, '0', STR_PAD_LEFT);
}

function listing_insert_row(array $d)
{
    $cols = array_keys($d);
    $sql = 'INSERT INTO listings (`' . implode('`, `', $cols) . '`) VALUES (' . implode(', ', array_fill(0, count($cols), '?')) . ')';
    db_exec($sql, array_values($d));
    return (int) db()->lastInsertId();
}

/** 저장: $existing(DB 행)이 있으면 수정, 없으면 새 코드로 등록. 반환 array(id, code) */
function listing_save($existing, array $d)
{
    $now = now_str();
    if ($d['status'] === 'closed') {
        $d['closed_at'] = ($existing && $existing['closed_at']) ? $existing['closed_at'] : $now;
    } else {
        $d['closed_at'] = null;
    }
    $d['updated_at'] = $now;

    if ($existing) {
        $set = implode(', ', array_map(function ($c) {
            return '`' . $c . '` = ?';
        }, array_keys($d)));
        $params = array_values($d);
        $params[] = (int) $existing['id'];
        db_exec('UPDATE listings SET ' . $set . ' WHERE id = ?', $params);
        // 목록에서 빠진 업로드 사진 파일은 지운다
        listing_delete_upload_files(array_diff(json_list($existing['images']), json_list($d['images'])));
        return array('id' => (int) $existing['id'], 'code' => $existing['code']);
    }

    $d['is_sample'] = 0;
    $d['created_at'] = $now;
    for ($try = 0; $try < 5; $try++) {
        $d['code'] = listing_next_code($d['deal_type']);
        try {
            $id = listing_insert_row($d);
            return array('id' => $id, 'code' => $d['code']);
        } catch (PDOException $ex) {
            if (!db_is_duplicate($ex) || $try === 4) {
                throw $ex;
            }
        }
    }
    throw new RuntimeException('매물 코드를 만들지 못했습니다.');
}

/** 상태 변경: closed 면 closed_at 기록(이미 있으면 유지), 그 외에는 비움 */
function listing_set_status(array $existing, $status)
{
    $closedAt = $status === 'closed' ? ($existing['closed_at'] ? $existing['closed_at'] : now_str()) : null;
    db_exec('UPDATE listings SET status = ?, closed_at = ?, updated_at = ? WHERE id = ?', array($status, $closedAt, now_str(), (int) $existing['id']));
}

/** /uploads/listings/ 아래 파일만 삭제 (데모 이미지 /images/… 는 건드리지 않음) */
function listing_delete_upload_files($paths)
{
    $base = realpath(MR_WEB_ROOT . '/uploads/listings');
    if ($base === false) {
        return;
    }
    foreach ($paths as $p) {
        if (!is_string($p) || strpos($p, '/uploads/listings/') !== 0 || strpos($p, '..') !== false) {
            continue;
        }
        $full = realpath(MR_WEB_ROOT . $p);
        if ($full !== false && strpos($full, $base . DIRECTORY_SEPARATOR) === 0 && is_file($full)) {
            @unlink($full);
        }
    }
}

/** 목록 탭 기준 같은 묶음: 매매 ↔ 매매, 임대·분양 ↔ 임대·분양 */
function listing_group_types($dealType)
{
    return $dealType === '매매' ? array('매매') : array('임대', '분양');
}
