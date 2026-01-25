pipeline {
    agent any
    
    environment {
        // Docker 镜像配置
        IMAGE_NAME = 'ftpsystem-client-frontend'
        IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKER_REGISTRY = '' // 如使用私有仓库，填写地址
        
        // 构建配置
        NODE_VERSION = '18'
        API_BASE_URL = 'http://localhost:8080' // 后端 API 地址
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 20, unit: 'MINUTES')
        disableConcurrentBuilds()
    }
    
    stages {
        stage('环境检查') {
            steps {
                script {
                    echo '检查构建环境...'
                    bat '''
                        echo Node 版本:
                        node --version
                        echo NPM 版本:
                        npm --version
                        echo Docker 版本:
                        docker --version
                    '''
                }
            }
        }
        
        stage('拉取代码') {
            steps {
                script {
                    echo '拉取最新代码...'
                    checkout scm
                }
            }
        }
        
        stage('安装依赖') {
            steps {
                script {
                    echo '安装 NPM 依赖...'
                    bat '''
                        npm ci
                    '''
                }
            }
        }
        
        stage('代码检查') {
            steps {
                script {
                    echo '运行代码检查...'
                    bat '''
                        npm run lint || echo "Lint 失败，继续构建"
                    '''
                }
            }
        }
        
        stage('构建项目') {
            steps {
                script {
                    echo '构建前端项目...'
                    bat """
                        set VITE_API_BASE_URL=${API_BASE_URL}
                        npm run build
                    """
                }
            }
        }
        
        stage('构建 Docker 镜像') {
            steps {
                script {
                    echo '构建 Docker 镜像...'
                    if (env.DOCKER_REGISTRY) {
                        bat """
                            docker build --build-arg VITE_API_BASE_URL=${API_BASE_URL} -t ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} .
                            docker tag ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest
                        """
                    } else {
                        bat """
                            docker build --build-arg VITE_API_BASE_URL=${API_BASE_URL} -t ${IMAGE_NAME}:${IMAGE_TAG} .
                            docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest
                        """
                    }
                }
            }
        }
        
        stage('推送镜像') {
            when {
                expression { return env.DOCKER_REGISTRY != '' }
            }
            steps {
                script {
                    echo '推送镜像到 Docker Registry...'
                    bat """
                        docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
                        docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest
                    """
                }
            }
        }
        
        stage('触发部署') {
            steps {
                script {
                    echo '触发部署流水线...'
                    build job: 'FtpSystem-Deploy', 
                          parameters: [
                              string(name: 'CLIENT_FRONTEND_IMAGE_TAG', value: "${IMAGE_TAG}")
                          ],
                          wait: false
                }
            }
        }
        
        stage('清理') {
            steps {
                script {
                    echo '清理构建产物和镜像...'
                    bat '''
                        docker image prune -f
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo '客户端前端构建成功！'
            echo "镜像标签: ${IMAGE_TAG}"
        }
        
        failure {
            echo '构建失败，请检查日志！'
        }
        
        always {
            echo '清理工作空间...'
            cleanWs(deleteDirs: true)
        }
    }
}
