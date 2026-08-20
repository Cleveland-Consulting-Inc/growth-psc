<?php
// Growth PSC coach photo upload endpoint
// Place this file at: public_html/gp-upload.php on premiersportscamps.com (NiXI Host)
// Images will be served at: https://premiersportscamps.com/coaches/filename.jpg

$uploadSecret = getenv('UPLOAD_SECRET') ?: '';
if (!$uploadSecret) {
    http_response_code(500);
    echo json_encode(['error' => 'Server misconfiguration']);
    exit;
}
define('COACHES_DIR', __DIR__ . '/coaches/');
define('PUBLIC_BASE', 'https://premiersportscamps.com/coaches');

header('Access-Control-Allow-Origin: https://growth.premiersportscamps.com');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: X-Upload-Secret');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$secret = $_SERVER['HTTP_X_UPLOAD_SECRET'] ?? '';
if (!hash_equals($uploadSecret, $secret)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if (empty($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No file provided']);
    exit;
}

$file = $_FILES['file'];
if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Upload error: ' . $file['error']]);
    exit;
}

$allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$mime = mime_content_type($file['tmp_name']);
if (!in_array($mime, $allowed)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type: ' . $mime]);
    exit;
}

$ext = match($mime) {
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/gif'  => 'gif',
    'image/webp' => 'webp',
    default      => 'jpg',
};

if (!is_dir(COACHES_DIR)) {
    mkdir(COACHES_DIR, 0755, true);
}

$filename = time() . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
$dest = COACHES_DIR . $filename;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file']);
    exit;
}

echo json_encode(['url' => PUBLIC_BASE . '/' . $filename]);
