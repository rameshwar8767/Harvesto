@Library('Shared') _

pipeline {
    agent any

    options {
        timeout(time: 45, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '15'))
        disableConcurrentBuilds()
        ansiColor('xterm')
    }

    environment {
        DOCKER_HUB_USERNAME = 'rameshwarrm'
        DOCKER_IMAGE_NAME = 'rameshwarrm/harvesto-app'
        DOCKER_MIGRATION_IMAGE_NAME = 'rameshwarrm/harvesto-migration'
        DOCKER_IMAGE_TAG = "${env.BUILD_NUMBER ?: 'latest'}"
        GITHUB_CREDENTIALS = credentials('github-credentials')
        GIT_BRANCH = 'main'
        GIT_REPO = 'https://github.com/rameshwar8767/Harvesto.git'
    }

    stages {
        stage('Cleanup Workspace') {
            steps {
                script {
                    clean_ws()
                }
            }
        }

        stage('Clone Repository') {
            steps {
                script {
                    clone("https://github.com/rameshwar8767/Harvesto.git", env.GIT_BRANCH)
                }
            }
        }

        stage('Run Unit Tests') {
            steps {
                script {
                    run_tests()
                }
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Main App Image') {
                    steps {
                        script {
                            docker_build(
                                imageName: env.DOCKER_IMAGE_NAME,
                                imageTag: env.DOCKER_IMAGE_TAG,
                                dockerfile: 'Dockerfile',
                                context: '.'
                            )
                        }
                    }
                }

                stage('Build Migration Image') {
                    steps {
                        script {
                            docker_build(
                                imageName: env.DOCKER_MIGRATION_IMAGE_NAME,
                                imageTag: env.DOCKER_IMAGE_TAG,
                                dockerfile: 'backend/scripts/Dockerfile.migration',
                                context: '.'
                            )
                        }
                    }
                }
            }
        }

        stage('Security Scan with Trivy') {
            steps {
                script {
                    trivy_scan()
                }
            }
        }

        stage('Push Docker Images') {
            parallel {
                stage('Push Main App Image') {
                    steps {
                        script {
                            docker_push(
                                imageName: env.DOCKER_IMAGE_NAME,
                                imageTag: env.DOCKER_IMAGE_TAG,
                                credentials: 'docker-hub-credentials'
                            )
                        }
                    }
                }

                stage('Push Migration Image') {
                    steps {
                        script {
                            docker_push(
                                imageName: env.DOCKER_MIGRATION_IMAGE_NAME,
                                imageTag: env.DOCKER_IMAGE_TAG,
                                credentials: 'docker-hub-credentials'
                            )
                        }
                    }
                }
            }
        }

        stage('Update Kubernetes Manifests') {
            steps {
                script {
                    update_k8s_manifests(
                        imageTag: env.DOCKER_IMAGE_TAG,
                        manifestsPath: 'kubernetes',
                        gitCredentials: 'github-credentials',
                        gitUserName: 'Jenkins CI',
                        gitUserEmail: 'manerameshwar909@gmail.com'
                    )
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "✔ Harvesto CI/CD Pipeline succeeded! Image tag ${env.DOCKER_IMAGE_TAG} published and manifests updated."
        }
        failure {
            echo "❌ Harvesto CI/CD Pipeline failed! Check stage logs for troubleshooting."
        }
    }
}