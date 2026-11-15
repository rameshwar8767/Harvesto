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
        // Application Metadata
        APP_NAME                    = 'Harvesto'
        DOCKER_IMAGE_NAME           = 'rameshwarrm/harvesto-app'
        DOCKER_MIGRATION_IMAGE_NAME = 'rameshwarrm/harvesto-migration'
        DOCKER_IMAGE_TAG            = "${env.BUILD_NUMBER ?: 'latest'}"

        // Git Configuration
        GIT_REPO                    = 'https://github.com/rameshwar8767/Harvesto.git'
        GIT_BRANCH                  = 'main'

        // Jenkins Credential IDs
        DOCKER_CREDENTIALS_ID       = 'docker-hub-credentials'
        GITHUB_CREDENTIALS_ID       = 'github-credentials'
    }

    stages {
        stage('Initialize & Clean') {
            steps {
                hello('Rameshwar')
                clean_ws(notFailBuild: true)
            }
        }

        stage('Clone Repository') {
            steps {
                clone(
                    url: env.GIT_REPO,
                    branch: env.GIT_BRANCH,
                    credentialsId: env.GITHUB_CREDENTIALS_ID,
                    shallow: true,
                    depth: 1
                )
            }
        }

        stage('Run Tests') {
            steps {
                // Auto-detects package.json / pom.xml / pytest / go.mod
                run_tests(ignoreFailures: false)
            }
        }

        stage('Security Scan - Filesystem') {
            steps {
                // Scans workspace dependencies before building Docker images
                trivy_scan(
                    scanType: 'fs',
                    target: '.',
                    severity: 'HIGH,CRITICAL',
                    exitCode: 0,
                    outputFile: 'trivy-fs-report.txt'
                )
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Main App Image') {
                    steps {
                        docker_build(
                            imageName: env.DOCKER_IMAGE_NAME,
                            imageTag: env.DOCKER_IMAGE_TAG,
                            dockerfile: 'Dockerfile',
                            context: '.',
                            tagLatest: true
                        )
                    }
                }

                stage('Build Migration Image') {
                    steps {
                        docker_build(
                            imageName: env.DOCKER_MIGRATION_IMAGE_NAME,
                            imageTag: env.DOCKER_IMAGE_TAG,
                            dockerfile: 'backend/Dockerfile.migration',
                            context: '.',
                            tagLatest: true
                        )
                    }
                }
            }
        }

        stage('Security Scan - Docker Images') {
            parallel {
                stage('Scan App Image') {
                    steps {
                        trivy_scan(
                            scanType: 'image',
                            target: "${env.DOCKER_IMAGE_NAME}:${env.DOCKER_IMAGE_TAG}",
                            severity: 'CRITICAL',
                            exitCode: 0,
                            outputFile: 'trivy-app-image-report.txt'
                        )
                    }
                }

                stage('Scan Migration Image') {
                    steps {
                        trivy_scan(
                            scanType: 'image',
                            target: "${env.DOCKER_MIGRATION_IMAGE_NAME}:${env.DOCKER_IMAGE_TAG}",
                            severity: 'CRITICAL',
                            exitCode: 0,
                            outputFile: 'trivy-migration-image-report.txt'
                        )
                    }
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                echo "==> Pushing Main Application Docker Image..."
                docker_push(
                    imageName: env.DOCKER_IMAGE_NAME,
                    imageTag: env.DOCKER_IMAGE_TAG,
                    credentialsId: env.DOCKER_CREDENTIALS_ID,
                    pushLatest: true
                )

                echo "==> Pushing Migration Docker Image..."
                docker_push(
                    imageName: env.DOCKER_MIGRATION_IMAGE_NAME,
                    imageTag: env.DOCKER_IMAGE_TAG,
                    credentialsId: env.DOCKER_CREDENTIALS_ID,
                    pushLatest: true
                )
            }
        }

        stage('Update Kubernetes Manifests') {
            steps {
                update_k8s_manifests(
                    imageTag: env.DOCKER_IMAGE_TAG,
                    images: [env.DOCKER_IMAGE_NAME, env.DOCKER_MIGRATION_IMAGE_NAME],
                    manifestsPath: 'kubernetes',
                    gitRepoUrl: env.GIT_REPO,
                    gitBranch: env.GIT_BRANCH,
                    gitCredentials: env.GITHUB_CREDENTIALS_ID,
                    gitUserName: 'Jenkins CI',
                    gitUserEmail: 'manerameshwar909@gmail.com',
                    commitMessage: "chore(k8s): update Harvesto image tags to ${env.DOCKER_IMAGE_TAG} [ci skip]"
                )
            }
        }
    }

    post {
        always {
            generate_reports(
                projectName: env.APP_NAME,
                imageName: env.DOCKER_IMAGE_NAME,
                imageTag: env.DOCKER_IMAGE_TAG,
                extraInfo: [
                    'Migration Image': env.DOCKER_MIGRATION_IMAGE_NAME,
                    'Git Repository' : env.GIT_REPO,
                    'Git Branch'     : env.GIT_BRANCH
                ]
            )
            clean_ws(notFailBuild: true)
        }
        success {
            echo "✔ ${env.APP_NAME} CI/CD Pipeline succeeded! Image tag ${env.DOCKER_IMAGE_TAG} published & K8s manifests updated."
        }
        failure {
            echo "❌ ${env.APP_NAME} CI/CD Pipeline failed! Please check stage console logs for diagnostics."
        }
    }
}