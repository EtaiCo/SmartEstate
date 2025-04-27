/*********************************************************************
 * Jenkinsfile – full CI pipeline for Python backend + React frontend
 * Requirements on the Jenkins node:
 *   • Docker Engine (or rootless Podman aliased to docker)
 *   • “Docker Pipeline” plugin (ID: docker-workflow)        ← enables agent { docker { … } }
 *   • Jenkins user is allowed to run docker commands
 *********************************************************************/
pipeline {
    /* ─────────────────────────────
       We’ll spin up purpose-built containers per stage.
       ───────────────────────────── */
    agent none                     // disable implicit “any”

    options {
        timestamps()
        ansiColor('xterm')
    }

    stages {

        /* -----------------------------------------------
         * 1. Checkout once so all stages share the source
         * --------------------------------------------- */
        stage('Checkout') {
            agent any
            steps {
                checkout scm
            }
        }

        /* ----------------------------
         * 2. Python backend: build & test
         * -------------------------- */
        stage('Backend – Build & Test') {
            agent {
                docker {
                    image 'python:3.12-alpine'
                    args  '-u root:root'        // root avoids uid mismatches
                    reuseNode true
                }
            }
            environment {
                PYTHONUNBUFFERED = '1'
            }
            steps {
                dir('backend') {
                    /* install deps only if requirements.txt exists */
                    sh '''
                        python -m pip install --upgrade pip
                        if [ -f requirements.txt ]; then
                            pip install -r requirements.txt
                        fi
                    '''
                    /* compile & test */
                    sh 'python -m py_compile $(find . -name "*.py" -not -path "./tests/*")'
                    sh '''
                        pip install --quiet pytest
                        pytest --junit-xml ../test-reports/backend.xml
                    '''
                }
            }
            post {
                always {
                    junit 'test-reports/backend.xml'
                }
            }
        }

        /* ----------------------------
         * 3. React frontend: build & test
         * -------------------------- */
        stage('Frontend – Build & Test') {
            agent {
                docker {
                    image 'node:20-alpine'
                    args  '-u node'            // drop to non-root user in official node image
                    reuseNode true
                }
            }
            environment {
                CI = 'true'                    // keeps CRA/Vite quiet & non-interactive
            }
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build --if-present'
                    /* run tests; generate junit.xml via jest-junit (or vitest-junit) */
                    sh '''
                        npx --yes jest --ci --runInBand \
                            --reporters=default \
                            --reporters=jest-junit
                    '''
                }
            }
            post {
                always {
                    /* jest-junit writes junit.xml in the project root by default */
                    junit 'frontend/junit.xml'
                    /* archive built static site (optional) */
                    archiveArtifacts artifacts: 'frontend/build/**', fingerprint: true
                }
            }
        }
    }

    /* ─────────────
       Global post-steps
       ───────────── */
    post {
        success { echo '🎉  Backend and Frontend pipelines both passed!' }
        failure { echo '💥  Something went wrong – check the stage logs above.' }
        cleanup { cleanWs() }
    }
}
