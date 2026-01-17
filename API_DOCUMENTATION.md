# FTP System API 接口文档

## 基础信息

- **Base URL**: `http://localhost:8080`
- **认证方式**: JWT Bearer Token
- **Content-Type**: `application/json` (除文件上传外)

## 通用响应格式

```json
{
    "code": 200,
    "message": "Success",
    "data": { ... }
}
```

## 错误响应格式

```json
{
    "code": 400,
    "message": "错误信息",
    "data": null
}
```

---

## 1. 认证模块 (AuthController)

### 1.1 用户登录

**接口**: `POST /api/auth/login`

**描述**: 用户登录获取JWT令牌

**请求头**: 无需认证

**请求体**:
```json
{
    "username": "admin",
    "password": "admin123"
}
```

**请求示例 (cURL)**:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**成功响应**:
```json
{
    "code": 200,
    "message": "Login successful",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "userId": 1,
        "username": "admin",
        "userType": 1,
        "userTypeName": "admin"
    }
}
```

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| token | String | JWT令牌，用于后续请求的Authorization头 |
| userId | Long | 用户ID |
| username | String | 用户名 |
| userType | Integer | 用户类型：0=普通用户，1=管理员 |
| userTypeName | String | 用户类型名称：normal/admin |

---

## 2. 管理端 - 用户管理 (AdminUserController)

> 以下接口需要管理员权限，请求头需携带: `Authorization: Bearer {token}`

### 2.1 获取用户列表

**接口**: `GET /api/admin/users`

**描述**: 分页获取所有用户列表

**请求参数**:
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页数量 |
| keyword | String | 否 | - | 搜索关键词(用户名) |

**请求示例**:
```bash
curl -X GET "http://localhost:8080/api/admin/users?page=1&size=10&keyword=admin" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**:
```json
{
    "code": 200,
    "message": "Success",
    "data": {
        "records": [
            {
                "id": 1,
                "username": "admin",
                "userType": 1,
                "userTypeName": "admin",
                "status": 1,
                "createTime": "2026-01-17T10:00:00",
                "updateTime": "2026-01-17T10:00:00"
            }
        ],
        "total": 1,
        "size": 10,
        "current": 1,
        "pages": 1
    }
}
```

### 2.2 获取单个用户

**接口**: `GET /api/admin/users/{id}`

**描述**: 根据ID获取用户详情

**请求示例**:
```bash
curl -X GET http://localhost:8080/api/admin/users/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**:
```json
{
    "code": 200,
    "message": "Success",
    "data": {
        "id": 1,
        "username": "admin",
        "userType": 1,
        "userTypeName": "admin",
        "status": 1,
        "createTime": "2026-01-17T10:00:00",
        "updateTime": "2026-01-17T10:00:00"
    }
}
```

### 2.3 创建用户

**接口**: `POST /api/admin/users`

**描述**: 创建新用户

**请求体**:
```json
{
    "username": "newuser",
    "password": "password123",
    "userType": 0,
    "status": 1
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | String | 是 | 用户名 |
| password | String | 是 | 密码 |
| userType | Integer | 是 | 用户类型：0=普通用户，1=管理员 |
| status | Integer | 否 | 状态：0=禁用，1=启用(默认) |

**请求示例**:
```bash
curl -X POST http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"username": "newuser", "password": "password123", "userType": 0, "status": 1}'
```

**成功响应**:
```json
{
    "code": 200,
    "message": "User created successfully",
    "data": {
        "id": 3,
        "username": "newuser",
        "userType": 0,
        "userTypeName": "normal",
        "status": 1,
        "createTime": "2026-01-17T12:00:00",
        "updateTime": "2026-01-17T12:00:00"
    }
}
```

### 2.4 更新用户

**接口**: `PUT /api/admin/users/{id}`

**描述**: 更新用户信息

**请求体**:
```json
{
    "username": "updateduser",
    "password": "newpassword123",
    "userType": 0,
    "status": 1
}
```

**请求示例**:
```bash
curl -X PUT http://localhost:8080/api/admin/users/3 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"username": "updateduser", "password": "newpassword123", "userType": 0, "status": 1}'
```

**成功响应**:
```json
{
    "code": 200,
    "message": "User updated successfully",
    "data": {
        "id": 3,
        "username": "updateduser",
        "userType": 0,
        "userTypeName": "normal",
        "status": 1,
        "createTime": "2026-01-17T12:00:00",
        "updateTime": "2026-01-17T12:30:00"
    }
}
```

### 2.5 删除用户

**接口**: `DELETE /api/admin/users/{id}`

**描述**: 删除用户

**请求示例**:
```bash
curl -X DELETE http://localhost:8080/api/admin/users/3 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**:
```json
{
    "code": 200,
    "message": "User deleted successfully",
    "data": null
}
```

---

## 3. 管理端 - 文件夹管理 (AdminFolderController)

> 以下接口需要管理员权限

### 3.1 获取文件夹列表

**接口**: `GET /api/admin/folders`

**描述**: 分页获取所有文件夹

**请求参数**:
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页数量 |
| keyword | String | 否 | - | 搜索关键词(文件夹名) |

**请求示例**:
```bash
curl -X GET "http://localhost:8080/api/admin/folders?page=1&size=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**:
```json
{
    "code": 200,
    "message": "Success",
    "data": {
        "records": [
            {
                "id": 1,
                "name": "Documents",
                "parentId": null,
                "parentName": null,
                "allowSubfolder": 1,
                "description": "Document files folder",
                "creatorId": 1,
                "creatorName": "admin",
                "path": "/Documents",
                "createTime": "2026-01-17T10:00:00",
                "updateTime": "2026-01-17T10:00:00",
                "children": null,
                "files": null
            }
        ],
        "total": 3,
        "size": 10,
        "current": 1,
        "pages": 1
    }
}
```

### 3.2 获取单个文件夹

**接口**: `GET /api/admin/folders/{id}`

**描述**: 根据ID获取文件夹详情

**请求示例**:
```bash
curl -X GET http://localhost:8080/api/admin/folders/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**:
```json
{
    "code": 200,
    "message": "Success",
    "data": {
        "id": 1,
        "name": "Documents",
        "parentId": null,
        "parentName": null,
        "allowSubfolder": 1,
        "description": "Document files folder",
        "creatorId": 1,
        "creatorName": "admin",
        "path": "/Documents",
        "createTime": "2026-01-17T10:00:00",
        "updateTime": "2026-01-17T10:00:00",
        "children": null,
        "files": null
    }
}
```

### 3.3 创建文件夹

**接口**: `POST /api/admin/folders`

**描述**: 创建新文件夹

**请求体**:
```json
{
    "name": "Work Documents",
    "parentId": 1,
    "allowSubfolder": 0,
    "description": "Work related documents"
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | String | 是 | 文件夹名称 |
| parentId | Long | 否 | 父文件夹ID，null表示根目录 |
| allowSubfolder | Integer | 是 | 是否允许创建子文件夹：0=不允许，1=允许 |
| description | String | 否 | 文件夹描述 |

**请求示例**:
```bash
curl -X POST http://localhost:8080/api/admin/folders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"name": "Work Documents", "parentId": 1, "allowSubfolder": 0, "description": "Work related documents"}'
```

**成功响应**:
```json
{
    "code": 200,
    "message": "Folder created successfully",
    "data": {
        "id": 4,
        "name": "Work Documents",
        "parentId": 1,
        "parentName": "Documents",
        "allowSubfolder": 0,
        "description": "Work related documents",
        "creatorId": 1,
        "creatorName": "admin",
        "path": "/Documents/Work Documents",
        "createTime": "2026-01-17T12:00:00",
        "updateTime": "2026-01-17T12:00:00",
        "children": null,
        "files": null
    }
}
```

**错误响应示例** (父文件夹不允许子文件夹):
```json
{
    "code": 400,
    "message": "Parent folder does not allow subfolders",
    "data": null
}
```

### 3.4 更新文件夹

**接口**: `PUT /api/admin/folders/{id}`

**描述**: 更新文件夹信息

**请求体**:
```json
{
    "name": "Updated Documents",
    "parentId": null,
    "allowSubfolder": 1,
    "description": "Updated description"
}
```

**请求示例**:
```bash
curl -X PUT http://localhost:8080/api/admin/folders/4 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Documents", "parentId": null, "allowSubfolder": 1, "description": "Updated description"}'
```

**成功响应**:
```json
{
    "code": 200,
    "message": "Folder updated successfully",
    "data": {
        "id": 4,
        "name": "Updated Documents",
        "parentId": null,
        "parentName": null,
        "allowSubfolder": 1,
        "description": "Updated description",
        "creatorId": 1,
        "creatorName": "admin",
        "path": "/Updated Documents",
        "createTime": "2026-01-17T12:00:00",
        "updateTime": "2026-01-17T12:30:00",
        "children": null,
        "files": null
    }
}
```

### 3.5 删除文件夹

**接口**: `DELETE /api/admin/folders/{id}`

**描述**: 删除文件夹（文件夹必须为空）

**请求示例**:
```bash
curl -X DELETE http://localhost:8080/api/admin/folders/4 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**:
```json
{
    "code": 200,
    "message": "Folder deleted successfully",
    "data": null
}
```

**错误响应示例** (文件夹非空):
```json
{
    "code": 400,
    "message": "Cannot delete folder with files",
    "data": null
}
```

### 3.6 获取文件夹树

**接口**: `GET /api/admin/folders/tree`

**描述**: 获取完整的文件夹树结构

**请求示例**:
```bash
curl -X GET http://localhost:8080/api/admin/folders/tree \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**:
```json
{
    "code": 200,
    "message": "Success",
    "data": [
        {
            "id": 1,
            "name": "Documents",
            "parentId": null,
            "parentName": null,
            "allowSubfolder": 1,
            "description": "Document files folder",
            "creatorId": 1,
            "creatorName": "admin",
            "path": "/Documents",
            "createTime": "2026-01-17T10:00:00",
            "updateTime": "2026-01-17T10:00:00",
            "children": [
                {
                    "id": 4,
                    "name": "Work Documents",
                    "parentId": 1,
                    "parentName": "Documents",
                    "allowSubfolder": 0,
                    "description": "Work related documents",
                    "creatorId": 1,
                    "creatorName": "admin",
                    "path": "/Documents/Work Documents",
                    "createTime": "2026-01-17T12:00:00",
                    "updateTime": "2026-01-17T12:00:00",
                    "children": [],
                    "files": null
                }
            ],
            "files": null
        },
        {
            "id": 2,
            "name": "Images",
            "parentId": null,
            "parentName": null,
            "allowSubfolder": 1,
            "description": "Image files folder",
            "creatorId": 1,
            "creatorName": "admin",
            "path": "/Images",
            "createTime": "2026-01-17T10:00:00",
            "updateTime": "2026-01-17T10:00:00",
            "children": [],
            "files": null
        },
        {
            "id": 3,
            "name": "Archives",
            "parentId": null,
            "parentName": null,
            "allowSubfolder": 0,
            "description": "Archive files folder (no subfolders allowed)",
            "creatorId": 1,
            "creatorName": "admin",
            "path": "/Archives",
            "createTime": "2026-01-17T10:00:00",
            "updateTime": "2026-01-17T10:00:00",
            "children": [],
            "files": null
        }
    ]
}
```

### 3.7 获取文件夹内的文件列表

**接口**: `GET /api/admin/folders/{folderId}/files`

**描述**: 获取指定文件夹内的所有文件

**请求示例**:
```bash
curl -X GET http://localhost:8080/api/admin/folders/1/files \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**:
```json
{
    "code": 200,
    "message": "Success",
    "data": [
        {
            "id": 1,
            "originalName": "report.pdf",
            "extension": "pdf",
            "fileSize": 1024000,
            "fileSizeFormatted": "1000.00 KB",
            "mimeType": "application/pdf",
            "folderId": 1,
            "folderName": "Documents",
            "uploaderId": 1,
            "uploaderName": "admin",
            "createTime": "2026-01-17T11:00:00",
            "updateTime": "2026-01-17T11:00:00"
        }
    ]
}
```

---

## 4. 管理端 - 文件管理 (AdminFileController)

> 以下接口需要管理员权限

### 4.1 获取文件列表

**接口**: `GET /api/admin/files`

**描述**: 分页获取所有文件

**请求参数**:
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页数量 |
| keyword | String | 否 | - | 搜索关键词(文件名) |

**请求示例**:
```bash
curl -X GET "http://localhost:8080/api/admin/files?page=1&size=10&keyword=report" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**:
```json
{
    "code": 200,
    "message": "Success",
    "data": {
        "records": [
            {
                "id": 1,
                "originalName": "report.pdf",
                "extension": "pdf",
                "fileSize": 1024000,
                "fileSizeFormatted": "1000.00 KB",
                "mimeType": "application/pdf",
                "folderId": 1,
                "folderName": "Documents",
                "uploaderId": 1,
                "uploaderName": "admin",
                "createTime": "2026-01-17T11:00:00",
                "updateTime": "2026-01-17T11:00:00"
            }
        ],
        "total": 1,
        "size": 10,
        "current": 1,
        "pages": 1
    }
}
```

### 4.2 获取单个文件信息

**接口**: `GET /api/admin/files/{id}`

**描述**: 根据ID获取文件详情

**请求示例**:
```bash
curl -X GET http://localhost:8080/api/admin/files/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**:
```json
{
    "code": 200,
    "message": "Success",
    "data": {
        "id": 1,
        "originalName": "report.pdf",
        "extension": "pdf",
        "fileSize": 1024000,
        "fileSizeFormatted": "1000.00 KB",
        "mimeType": "application/pdf",
        "folderId": 1,
        "folderName": "Documents",
        "uploaderId": 1,
        "uploaderName": "admin",
        "createTime": "2026-01-17T11:00:00",
        "updateTime": "2026-01-17T11:00:00"
    }
}
```

### 4.3 更新文件信息

**接口**: `PUT /api/admin/files/{id}`

**描述**: 更新文件信息（重命名或移动到其他文件夹）

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| newName | String | 否 | 新文件名 |
| newFolderId | Long | 否 | 目标文件夹ID |

**请求示例** (重命名文件):
```bash
curl -X PUT "http://localhost:8080/api/admin/files/1?newName=annual_report.pdf" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**请求示例** (移动文件到其他文件夹):
```bash
curl -X PUT "http://localhost:8080/api/admin/files/1?newFolderId=2" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**请求示例** (同时重命名和移动):
```bash
curl -X PUT "http://localhost:8080/api/admin/files/1?newName=annual_report.pdf&newFolderId=2" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**:
```json
{
    "code": 200,
    "message": "File updated successfully",
    "data": {
        "id": 1,
        "originalName": "annual_report.pdf",
        "extension": "pdf",
        "fileSize": 1024000,
        "fileSizeFormatted": "1000.00 KB",
        "mimeType": "application/pdf",
        "folderId": 2,
        "folderName": "Images",
        "uploaderId": 1,
        "uploaderName": "admin",
        "createTime": "2026-01-17T11:00:00",
        "updateTime": "2026-01-17T12:30:00"
    }
}
```

### 4.4 删除文件

**接口**: `DELETE /api/admin/files/{id}`

**描述**: 删除文件

**请求示例**:
```bash
curl -X DELETE http://localhost:8080/api/admin/files/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**:
```json
{
    "code": 200,
    "message": "File deleted successfully",
    "data": null
}
```

---

## 5. 用户端 - 文件夹浏览 (ClientFolderController)

> 以下接口需要用户认证（普通用户和管理员均可访问）

### 5.1 获取根目录文件夹列表

**接口**: `GET /api/user/folders`

**描述**: 获取所有根目录文件夹

**请求示例**:
```bash
curl -X GET http://localhost:8080/api/user/folders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**:
```json
{
    "code": 200,
    "message": "Success",
    "data": [
        {
            "id": 1,
            "name": "Documents",
            "parentId": null,
            "parentName": null,
            "allowSubfolder": 1,
            "description": "Document files folder",
            "creatorId": 1,
            "creatorName": "admin",
            "path": "/Documents",
            "createTime": "2026-01-17T10:00:00",
            "updateTime": "2026-01-17T10:00:00",
            "children": null,
            "files": null
        },
        {
            "id": 2,
            "name": "Images",
            "parentId": null,
            "parentName": null,
            "allowSubfolder": 1,
            "description": "Image files folder",
            "creatorId": 1,
            "creatorName": "admin",
            "path": "/Images",
            "createTime": "2026-01-17T10:00:00",
            "updateTime": "2026-01-17T10:00:00",
            "children": null,
            "files": null
        },
        {
            "id": 3,
            "name": "Archives",
            "parentId": null,
            "parentName": null,
            "allowSubfolder": 0,
            "description": "Archive files folder (no subfolders allowed)",
            "creatorId": 1,
            "creatorName": "admin",
            "path": "/Archives",
            "createTime": "2026-01-17T10:00:00",
            "updateTime": "2026-01-17T10:00:00",
            "children": null,
            "files": null
        }
    ]
}
```

### 5.2 获取文件夹树

**接口**: `GET /api/user/folders/tree`

**描述**: 获取完整的文件夹树结构

**请求示例**:
```bash
curl -X GET http://localhost:8080/api/user/folders/tree \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**: (同管理端 3.6)

### 5.3 获取文件夹详情及内容

**接口**: `GET /api/user/folders/{id}`

**描述**: 获取文件夹详情，包含子文件夹和文件列表

**请求示例**:
```bash
curl -X GET http://localhost:8080/api/user/folders/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**:
```json
{
    "code": 200,
    "message": "Success",
    "data": {
        "id": 1,
        "name": "Documents",
        "parentId": null,
        "parentName": null,
        "allowSubfolder": 1,
        "description": "Document files folder",
        "creatorId": 1,
        "creatorName": "admin",
        "path": "/Documents",
        "createTime": "2026-01-17T10:00:00",
        "updateTime": "2026-01-17T10:00:00",
        "children": [
            {
                "id": 4,
                "name": "Work Documents",
                "parentId": 1,
                "parentName": "Documents",
                "allowSubfolder": 0,
                "description": "Work related documents",
                "creatorId": 1,
                "creatorName": "admin",
                "path": "/Documents/Work Documents",
                "createTime": "2026-01-17T12:00:00",
                "updateTime": "2026-01-17T12:00:00",
                "children": null,
                "files": null
            }
        ],
        "files": [
            {
                "id": 1,
                "originalName": "report.pdf",
                "extension": "pdf",
                "fileSize": 1024000,
                "fileSizeFormatted": "1000.00 KB",
                "mimeType": "application/pdf",
                "folderId": 1,
                "folderName": "Documents",
                "uploaderId": 1,
                "uploaderName": "admin",
                "createTime": "2026-01-17T11:00:00",
                "updateTime": "2026-01-17T11:00:00"
            }
        ]
    }
}
```

### 5.4 获取子文件夹列表

**接口**: `GET /api/user/folders/{parentId}/children`

**描述**: 获取指定文件夹下的子文件夹

**请求示例**:
```bash
curl -X GET http://localhost:8080/api/user/folders/1/children \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**:
```json
{
    "code": 200,
    "message": "Success",
    "data": [
        {
            "id": 4,
            "name": "Work Documents",
            "parentId": 1,
            "parentName": "Documents",
            "allowSubfolder": 0,
            "description": "Work related documents",
            "creatorId": 1,
            "creatorName": "admin",
            "path": "/Documents/Work Documents",
            "createTime": "2026-01-17T12:00:00",
            "updateTime": "2026-01-17T12:00:00",
            "children": null,
            "files": null
        }
    ]
}
```

### 5.5 获取文件夹内的文件列表

**接口**: `GET /api/user/folders/{folderId}/files`

**描述**: 获取指定文件夹内的所有文件

**请求示例**:
```bash
curl -X GET http://localhost:8080/api/user/folders/1/files \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**: (同管理端 3.7)

---

## 6. 用户端 - 文件操作 (ClientFileController)

> 以下接口需要用户认证（普通用户和管理员均可访问）

### 6.1 上传单个文件

**接口**: `POST /api/user/files/upload`

**描述**: 上传单个文件到指定文件夹

**Content-Type**: `multipart/form-data`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | 要上传的文件 |
| folderId | Long | 是 | 目标文件夹ID |

**请求示例**:
```bash
curl -X POST http://localhost:8080/api/user/files/upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "file=@/path/to/report.pdf" \
  -F "folderId=1"
```

**成功响应**:
```json
{
    "code": 200,
    "message": "File uploaded successfully",
    "data": {
        "id": 1,
        "originalName": "report.pdf",
        "extension": "pdf",
        "fileSize": 1024000,
        "fileSizeFormatted": "1000.00 KB",
        "mimeType": "application/pdf",
        "folderId": 1,
        "folderName": "Documents",
        "uploaderId": 1,
        "uploaderName": "admin",
        "createTime": "2026-01-17T11:00:00",
        "updateTime": "2026-01-17T11:00:00"
    }
}
```

**错误响应示例** (文件夹不存在):
```json
{
    "code": 404,
    "message": "Folder not found",
    "data": null
}
```

### 6.2 上传多个文件

**接口**: `POST /api/user/files/upload-multiple`

**描述**: 同时上传多个文件到指定文件夹

**Content-Type**: `multipart/form-data`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| files | File[] | 是 | 要上传的文件数组 |
| folderId | Long | 是 | 目标文件夹ID |

**请求示例**:
```bash
curl -X POST http://localhost:8080/api/user/files/upload-multiple \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "files=@/path/to/file1.pdf" \
  -F "files=@/path/to/file2.docx" \
  -F "folderId=1"
```

**成功响应**:
```json
{
    "code": 200,
    "message": "Files uploaded successfully",
    "data": [
        {
            "id": 1,
            "originalName": "file1.pdf",
            "extension": "pdf",
            "fileSize": 1024000,
            "fileSizeFormatted": "1000.00 KB",
            "mimeType": "application/pdf",
            "folderId": 1,
            "folderName": "Documents",
            "uploaderId": 1,
            "uploaderName": "admin",
            "createTime": "2026-01-17T11:00:00",
            "updateTime": "2026-01-17T11:00:00"
        },
        {
            "id": 2,
            "originalName": "file2.docx",
            "extension": "docx",
            "fileSize": 512000,
            "fileSizeFormatted": "500.00 KB",
            "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "folderId": 1,
            "folderName": "Documents",
            "uploaderId": 1,
            "uploaderName": "admin",
            "createTime": "2026-01-17T11:00:00",
            "updateTime": "2026-01-17T11:00:00"
        }
    ]
}
```

### 6.3 下载文件

**接口**: `GET /api/user/files/{id}/download`

**描述**: 下载指定文件

**请求示例**:
```bash
curl -X GET http://localhost:8080/api/user/files/1/download \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -o downloaded_file.pdf
```

**响应**:
- **Content-Type**: 文件的MIME类型
- **Content-Disposition**: `attachment; filename*=UTF-8''文件名`
- **Body**: 文件二进制内容

### 6.4 获取文件信息

**接口**: `GET /api/user/files/{id}`

**描述**: 获取文件详情（不下载）

**请求示例**:
```bash
curl -X GET http://localhost:8080/api/user/files/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**:
```json
{
    "code": 200,
    "message": "Success",
    "data": {
        "id": 1,
        "originalName": "report.pdf",
        "extension": "pdf",
        "fileSize": 1024000,
        "fileSizeFormatted": "1000.00 KB",
        "mimeType": "application/pdf",
        "folderId": 1,
        "folderName": "Documents",
        "uploaderId": 1,
        "uploaderName": "admin",
        "createTime": "2026-01-17T11:00:00",
        "updateTime": "2026-01-17T11:00:00"
    }
}
```

---

## 7. 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证或认证失败 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 8. 默认测试账号

| 用户名 | 密码 | 类型 | 说明 |
|--------|------|------|------|
| admin | admin123 | 管理员 | 可访问所有接口 |
| user | user123 | 普通用户 | 只能访问用户端接口 |

---

## 9. 前端集成示例 (JavaScript/Axios)

### 9.1 登录

```javascript
const login = async (username, password) => {
    const response = await axios.post('/api/auth/login', {
        username,
        password
    });
    const { token } = response.data.data;
    // 存储token
    localStorage.setItem('token', token);
    // 设置默认请求头
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return response.data;
};
```

### 9.2 上传文件

```javascript
const uploadFile = async (file, folderId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderId', folderId);
    
    const response = await axios.post('/api/user/files/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};
```

### 9.3 下载文件

```javascript
const downloadFile = async (fileId, fileName) => {
    const response = await axios.get(`/api/user/files/${fileId}/download`, {
        responseType: 'blob'
    });
    
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
};
```
