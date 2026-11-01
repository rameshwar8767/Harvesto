@Library('Shared')

pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'rameshwarrm/heristo-app'
        DOCKER_MIGRATION_IMAGE_NAME = 'rameshwarrm/heristo-migration'
        DOCKER_IMAGE_TAG = "${BUILD_NUMBER}"
        GITHUB_CREDENTIALS = credentials('github-credentials')
        GIT_BRANCH = 'main'
    }

    stages {
        stage('Cleanup Workspace') {
            steps{
                script{
                    clean_ws()
                }
            }
        }

        stage('Clone Repository') {
            steps {
                script {
                    clone("https://github.com/rameshwar8767/Harvesto.git","main")
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
                                dockerfile: 'scripts/Dockerfile.migration',
                                context: '.'
                            )
                        }
                    }
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

        stage('Security Scan with Trivy') {
            steps {
                script {
                    // Create directory for results
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

        // Add this new stage
        stage('Update Kubernetes Manifests') {
            steps {
                script {
                    update_k8s_manifests{
                        imageTag: env.DOCKER_IMAGE_TAG,
                        manifestsPath: 'kubernetes',
                        gitCredentials: 'github-credentials',
                        gitUserName: 'Jenkins CI',
                        gitUserEmail: 'manerameshwar909@gmail.com'
                    }
                }
            }
        }

    }
}