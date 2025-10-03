# 部署指南（Deployment Guide）

## 目錄
1. [系統需求](#系統需求)
2. [環境準備](#環境準備)
3. [安裝步驟](#安裝步驟)
4. [設定檔配置](#設定檔配置)
5. [資料庫遷移](#資料庫遷移)
6. [前端編譯](#前端編譯)
7. [佇列服務](#佇列服務)
8. [定時任務](#定時任務)
9. [生產環境部署](#生產環境部署)
10. [監控與日誌](#監控與日誌)
11. [常見問題](#常見問題)

---

## 系統需求

### 伺服器需求
- **作業系統**: Ubuntu 22.04 LTS 或更新版本
- **CPU**: 2 核心以上
- **記憶體**: 4GB 以上（推薦 8GB）
- **硬碟空間**: 20GB 以上

### 軟體需求
- **PHP**: >= 8.2
  - Extensions: BCMath, Ctype, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML, GD, Intl
- **Composer**: >= 2.6
- **Node.js**: >= 20.x
- **npm**: >= 10.x
- **MySQL**: >= 8.0（或 MariaDB >= 10.6）
- **Redis**: >= 7.0（選用，用於佇列和快取）
- **Nginx**: >= 1.24（或 Apache >= 2.4）

---

## 環境準備

### 1. 安裝 PHP 8.2

```bash
# 新增 PPA repository
sudo add-apt-repository ppa:ondrej/php
sudo apt update

# 安裝 PHP 及必要 extensions
sudo apt install -y php8.2 php8.2-fpm php8.2-cli php8.2-common \
    php8.2-mysql php8.2-zip php8.2-gd php8.2-mbstring php8.2-curl \
    php8.2-xml php8.2-bcmath php8.2-intl php8.2-redis

# 驗證版本
php -v
```

### 2. 安裝 Composer

```bash
# 下載 Composer
curl -sS https://getcomposer.org/installer -o composer-setup.php

# 安裝
sudo php composer-setup.php --install-dir=/usr/local/bin --filename=composer

# 驗證
composer --version
```

### 3. 安裝 Node.js 20.x

```bash
# 使用 NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# 安裝 Node.js
sudo apt install -y nodejs

# 驗證
node -v
npm -v
```

### 4. 安裝 MySQL 8.0

```bash
# 安裝 MySQL Server
sudo apt install -y mysql-server

# 啟動服務
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全設定
sudo mysql_secure_installation

# 建立資料庫
sudo mysql -u root -p
```

```sql
CREATE DATABASE csie_fk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'csie_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON csie_fk.* TO 'csie_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 5. 安裝 Redis（選用）

```bash
# 安裝 Redis
sudo apt install -y redis-server

# 啟動服務
sudo systemctl start redis-server
sudo systemctl enable redis-server

# 測試連線
redis-cli ping
```

### 6. 安裝 Nginx

```bash
# 安裝 Nginx
sudo apt install -y nginx

# 啟動服務
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 安裝步驟

### 1. Clone 專案

```bash
# 進入 web root
cd /var/www

# Clone 專案（使用 HTTPS 或 SSH）
sudo git clone https://github.com/your-org/csie_fk.git
cd csie_fk

# 設定權限
sudo chown -R www-data:www-data /var/www/csie_fk
sudo chmod -R 755 /var/www/csie_fk
```

### 2. 安裝 PHP 套件

```bash
# 安裝 Composer 套件
composer install --optimize-autoloader --no-dev

# 或者在開發環境
composer install
```

### 3. 安裝 Node.js 套件

```bash
# 安裝 npm 套件
npm install

# 或使用 npm ci（生產環境推薦）
npm ci
```

### 4. 設定環境變數

```bash
# 複製環境設定檔
cp .env.example .env

# 生成 Application Key
php artisan key:generate
```

### 5. 編輯 `.env` 檔案

```bash
nano .env
```

```env
APP_NAME="CSIE Management System"
APP_ENV=production
APP_KEY=base64:your_generated_key
APP_DEBUG=false
APP_URL=https://your-domain.com

# 資料庫設定
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=csie_fk
DB_USERNAME=csie_user
DB_PASSWORD=your_secure_password

# 快取設定（使用 Redis）
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Redis 設定
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Email 設定
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=no-reply@your-domain.com
MAIL_FROM_NAME="${APP_NAME}"

# 檔案系統
FILESYSTEM_DISK=public

# 佇列設定
QUEUE_CONNECTION=redis
```

---

## 設定檔配置

### 1. Nginx 設定

建立 Nginx site 設定檔：

```bash
sudo nano /etc/nginx/sites-available/csie_fk
```

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    root /var/www/csie_fk/public;
    index index.php index.html;

    # SSL 憑證（使用 Let's Encrypt）
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 日誌
    access_log /var/log/nginx/csie_fk_access.log;
    error_log /var/log/nginx/csie_fk_error.log;

    # 檔案上傳大小限制
    client_max_body_size 100M;

    # Gzip 壓縮
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # 靜態資源快取
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

啟用 site：

```bash
# 建立符號連結
sudo ln -s /etc/nginx/sites-available/csie_fk /etc/nginx/sites-enabled/

# 測試設定
sudo nginx -t

# 重新載入 Nginx
sudo systemctl reload nginx
```

### 2. PHP-FPM 調整（選用）

```bash
sudo nano /etc/php/8.2/fpm/pool.d/www.conf
```

```ini
; 增加 worker 數量
pm = dynamic
pm.max_children = 50
pm.start_servers = 10
pm.min_spare_servers = 5
pm.max_spare_servers = 20
pm.max_requests = 500

; 記憶體限制
php_admin_value[memory_limit] = 256M
php_admin_value[upload_max_filesize] = 100M
php_admin_value[post_max_size] = 100M
```

重啟 PHP-FPM：

```bash
sudo systemctl restart php8.2-fpm
```

### 3. SSL 憑證（Let's Encrypt）

```bash
# 安裝 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 取得憑證
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自動續約
sudo certbot renew --dry-run
```

---

## 資料庫遷移

### 1. 執行遷移

```bash
# 執行資料庫遷移
php artisan migrate --force

# 或者包含 seeders（僅開發/測試環境）
php artisan migrate:fresh --seed
```

### 2. 建立管理員帳號

```bash
# 使用 tinker 建立管理員
php artisan tinker
```

```php
$admin = new App\Models\User();
$admin->name = 'Admin';
$admin->email = 'admin@your-domain.com';
$admin->password = bcrypt('secure_password');
$admin->role = 'admin';
$admin->status = 1;
$admin->save();
exit;
```

或使用自訂 Artisan 指令：

```bash
php artisan user:create-admin
```

### 3. 執行 Seeders（選用）

```bash
# 執行 Demo 資料 Seeder
php artisan db:seed --class=DemoUserSeeder
php artisan db:seed --class=TagSeeder
php artisan db:seed --class=SpaceSeeder
php artisan db:seed --class=SupportFaqSeeder
```

---

## 前端編譯

### 1. 開發環境

```bash
# 開發模式（hot reload）
npm run dev
```

### 2. 生產環境

```bash
# 編譯前端資源
npm run build

# 最佳化輸出
npm run build -- --mode production
```

### 3. 檢查編譯結果

```bash
# 確認 build 資料夾存在
ls -la public/build

# 檢查 manifest.json
cat public/build/manifest.json
```

---

## 佇列服務

### 1. 設定 Supervisor

安裝 Supervisor：

```bash
sudo apt install -y supervisor
```

建立 worker 設定檔：

```bash
sudo nano /etc/supervisor/conf.d/csie_fk_worker.conf
```

```ini
[program:csie_fk_worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/csie_fk/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/www/csie_fk/storage/logs/worker.log
stopwaitsecs=3600
```

啟動 worker：

```bash
# 重新載入設定
sudo supervisorctl reread
sudo supervisorctl update

# 啟動 worker
sudo supervisorctl start csie_fk_worker:*

# 檢查狀態
sudo supervisorctl status
```

### 2. 測試佇列

```bash
# 手動執行 queue worker（測試用）
php artisan queue:work --once

# 檢查佇列狀態
php artisan queue:monitor redis

# 清空失敗的任務
php artisan queue:flush
```

---

## 定時任務

### 1. 設定 Cron

```bash
# 編輯 crontab
sudo crontab -e -u www-data
```

新增以下內容：

```cron
# Laravel Scheduler
* * * * * cd /var/www/csie_fk && php artisan schedule:run >> /dev/null 2>&1
```

### 2. 註冊定時任務

在 `app/Console/Kernel.php` 中定義：

```php
protected function schedule(Schedule $schedule): void
{
    // 每天清理過期通知
    $schedule->command('notifications:clean --days=30')
        ->daily()
        ->at('02:00');

    // 每週備份資料庫
    $schedule->command('backup:run')
        ->weekly()
        ->sundays()
        ->at('03:00');

    // 每小時檢查 Space 同步狀態
    $schedule->command('space:check-sync')
        ->hourly();
}
```

### 3. 測試定時任務

```bash
# 手動執行 scheduler
php artisan schedule:run

# 列出所有定時任務
php artisan schedule:list
```

---

## 生產環境部署

### 1. 最佳化配置

```bash
# 清除所有快取
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# 快取配置
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 最佳化 autoloader
composer dump-autoload --optimize
```

### 2. 設定檔案權限

```bash
# Storage 和 cache 目錄
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# 建立 symbolic link
php artisan storage:link
```

### 3. 啟用維護模式

```bash
# 進入維護模式
php artisan down --message="系統維護中，請稍後再試" --retry=60

# 執行更新...

# 離開維護模式
php artisan up
```

### 4. 部署腳本

建立 `deploy.sh`：

```bash
#!/bin/bash

echo "🚀 開始部署..."

# 進入維護模式
php artisan down

# 拉取最新代碼
git pull origin main

# 安裝套件
composer install --no-dev --optimize-autoloader
npm ci

# 編譯前端
npm run build

# 執行遷移
php artisan migrate --force

# 清除並快取配置
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 重啟 queue workers
sudo supervisorctl restart csie_fk_worker:*

# 離開維護模式
php artisan up

echo "✅ 部署完成！"
```

執行部署：

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 監控與日誌

### 1. Laravel Log

```bash
# 即時查看日誌
tail -f storage/logs/laravel.log

# 查看錯誤日誌
grep ERROR storage/logs/laravel.log

# 日誌輪轉（使用 logrotate）
sudo nano /etc/logrotate.d/laravel
```

```
/var/www/csie_fk/storage/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0640 www-data www-data
}
```

### 2. Nginx Log

```bash
# Access log
tail -f /var/log/nginx/csie_fk_access.log

# Error log
tail -f /var/log/nginx/csie_fk_error.log
```

### 3. 系統監控

安裝監控工具：

```bash
# 安裝 htop
sudo apt install -y htop

# 安裝 nmon
sudo apt install -y nmon

# 監控記憶體使用
free -h

# 監控磁碟空間
df -h
```

### 4. 應用程式監控

可使用以下工具：
- **Laravel Telescope**: 本地開發除錯工具
- **Sentry**: 錯誤追蹤服務
- **New Relic**: APM 效能監控
- **Datadog**: 完整監控解決方案

---

## 常見問題

### 1. Permission Denied

```bash
# 修正權限
sudo chown -R www-data:www-data /var/www/csie_fk
sudo chmod -R 775 storage bootstrap/cache
```

### 2. 500 Internal Server Error

```bash
# 檢查 Laravel log
tail -f storage/logs/laravel.log

# 檢查 Nginx error log
tail -f /var/log/nginx/csie_fk_error.log

# 確認 .env 設定正確
php artisan config:cache
```

### 3. Queue Jobs 不執行

```bash
# 檢查 Supervisor 狀態
sudo supervisorctl status

# 重啟 workers
sudo supervisorctl restart csie_fk_worker:*

# 檢查 Redis 連線
redis-cli ping
```

### 4. 前端資源 404

```bash
# 重新編譯
npm run build

# 檢查 manifest.json
cat public/build/manifest.json

# 清除瀏覽器快取
```

### 5. 資料庫連線失敗

```bash
# 測試資料庫連線
php artisan tinker
>>> DB::connection()->getPdo();

# 檢查 MySQL 狀態
sudo systemctl status mysql

# 檢查防火牆規則
sudo ufw status
```

---

## 安全性建議

### 1. 防火牆設定

```bash
# 啟用 UFW
sudo ufw enable

# 允許 SSH
sudo ufw allow 22

# 允許 HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# 檢查狀態
sudo ufw status
```

### 2. 定期更新

```bash
# 更新系統套件
sudo apt update && sudo apt upgrade -y

# 更新 Composer 套件
composer update

# 更新 npm 套件
npm update
```

### 3. 備份策略

```bash
# 資料庫備份
mysqldump -u csie_user -p csie_fk > backup_$(date +%Y%m%d).sql

# 附件備份
tar -czf attachments_$(date +%Y%m%d).tar.gz storage/app/public/attachments

# 使用 Laravel Backup 套件
composer require spatie/laravel-backup
php artisan backup:run
```

---

**文件版本**: 1.0.0  
**最後更新**: 2025-10-03  
**維護人員**: DevOps 團隊
