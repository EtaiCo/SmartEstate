/*
 * Jenkinsfile  –  Python backend + React frontend
 * Requires only:
 *   • “Docker” plugin  (ID: docker-plugin)       →  gives the dockerContainer agent
 *   • a Jenkins node that can run `docker`
 *
 * When you eventually install the “Docker Pipeline” plugin (docker-workflow)
 * you can replace each `dockerContainer { image '…' }` block with
 * `docker { image '…' args '-u root:root' reuseNode true }`
 * and gain extra options, but it’s not needed for basic CI.
 */

pipeline {
    agent none                    // every stage picks its own container
    options { timestamps() }      // built-in; no extra plugin required

    stages {

        /* ─────────────────────────────
           Shared checkout (one per job)
           ───────────────────────────── */
        stage('Checkout') {
            agent any
            steps { checkout scm }
        }

        /* ─────────────────────────────
           1.  BACKEND  –  build
           ───────────────────────────── */
        stage('Backend – Build') {
            agent {
                dockerContainer { image 'python:3.12-alpine' }
            }
            steps {
                dir('backend') {
                    sh '''
                        python -m pip install --upgrade pip
                        if [ -f requirements.txt ]; then
                            pip install -r requirements.txt
                        fi
                        # byte-compile every .py file (skip tests/ when it arrives)
                        python - <<'PY'
import pathlib, py_compile
for p in pathlib.Path('.').rglob('*.py'):
    if 'tests' not in p.parts:
        py_compile.compile(str(p), doraise=True)
PY
                    '''
                }
            }
        }

        /* ─────────────────────────────
           2.  BACKEND  –  tests (optional)
           Runs only after you create backend/tests/
           ───────────────────────────── */
        stage('Backend – Test') {
            when { expression { fileExists('backend/tests') } }
            agent {
                dockerContainer { image 'python:3.12-alpine' }
            }
            steps {
                dir('backend') {
                    sh '''
                        pip install --quiet pytest
                        pytest --junit-xml ../test-reports/backend.xml
                    '''
                }
            }
            post {
                always {
                    /* allowEmptyResults keeps the stage green
                       until you actually produce results */
                    junit testResults: 'test-reports/backend.xml',
                          allowEmptyResults: true
                }
            }
        }

        /* ─────────────────────────────
           3.  FRONTEND  –  build
           ───────────────────────────── */
        stage('Frontend – Build') {
            agent {
                dockerContainer { image 'node:20-alpine' }
            }
            environment { CI = 'true' }   // keeps CRA / Vite quiet
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: 'frontend/build/**',
                                      fingerprint: true
                }
            }
        }

        /* ─────────────────────────────
           4.  FRONTEND  –  tests (optional)
           Runs only when you add a Jest/Vitest setup that outputs junit.xml
           ───────────────────────────── */
        stage('Frontend – Test') {
            when { expression { fileExists('frontend/src/__tests__') } }
            agent {
                dockerContainer { image 'node:20-alpine' }
            }
            environment { CI = 'true' }
            steps {
                dir('frontend') {
                    sh '''
                        npm ci
                        # make sure you configure jest-junit or vitest-junit
                        # to write junit.xml into the project root
                        npm test -- --ci --runInBand
                    '''
                }
            }
            post {
                always {
                    junit testResults: 'frontend/junit.xml',
                          allowEmptyResults: true
                }
            }
        }
    }

    /* ─────────────────────────────
       House-keeping
       ───────────────────────────── */
    post {
        success { echo '🎉  Build finished successfully!' }
        failure { echo '💥  Build failed – check the stage logs.' }
        /* requires “Workspace Cleanup” plugin; remove if you don’t have it */
        cleanup { cleanWs() }
    }
}
