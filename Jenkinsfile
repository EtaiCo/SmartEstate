/*
 * Jenkinsfile  – Python backend + React frontend
 * ------------------------------------------------
 * • Requires only:   Docker CLI on the Jenkins node.
 * • No plugin installs, no admin rights.
 * • Test stages auto-enable when you add tests.
 */

pipeline {
    agent any                       // run on the regular Jenkins node
    options { timestamps() }        // built-in; no plugin needed

    stages {

        /* ─────────────────────────────
           1. Checkout once            │
           ───────────────────────────── */
        stage('Checkout') {
            steps { checkout scm }
        }

        /* ─────────────────────────────
           2. Backend – Build          │
           ───────────────────────────── */
        stage('Backend – Build') {
            steps {
                sh '''
                    # Run backend build in a throw-away Python container
                    docker run --rm \
                        -v "$PWD/backend":/src \
                        -w /src \
                        python:3.12-alpine \
                        sh -c "
                            python -m pip install --upgrade pip &&
                            [ -f requirements.txt ] && pip install -r requirements.txt || true &&
                            python - <<'PY'
import pathlib, py_compile
for p in pathlib.Path('.').rglob('*.py'):
    if 'tests' not in p.parts:
        py_compile.compile(str(p), doraise=True)
PY
                        "
                '''
            }
        }

        /* ─────────────────────────────
           3. Backend – Test (optional)│
           Runs only if backend/tests/ │
           ───────────────────────────── */
        stage('Backend – Test') {
            when { expression { fileExists('backend/tests') } }
            steps {
                sh '''
                    docker run --rm \
                        -v "$PWD/backend":/src \
                        -w /src \
                        python:3.12-alpine \
                        sh -c "
                            pip install --quiet pytest &&
                            pytest -q --junit-xml /src/../test-reports/backend.xml
                        "
                '''
            }
            post {
                always {
                    junit allowEmptyResults: true,
                          testResults: 'test-reports/backend.xml'
                }
            }
        }

        /* ─────────────────────────────
           4. Frontend – Build         │
           ───────────────────────────── */
        stage('Frontend – Build') {
            environment { CI = 'true' }
            steps {
                sh '''
                    docker run --rm \
                        -v "$PWD/frontend":/src \
                        -w /src \
                        -e CI=true \
                        node:20-alpine \
                        sh -c "
                            npm ci &&
                            npm run build
                        "
                '''
            }
            post {
                success {
                    archiveArtifacts artifacts: 'frontend/build/**',
                                      fingerprint: true
                }
            }
        }

        /* ─────────────────────────────
           5. Frontend – Test (optional)
           Runs only if __tests__ exist │
           ───────────────────────────── */
        stage('Frontend – Test') {
            when { expression { fileExists('frontend/src/__tests__') } }
            environment { CI = 'true' }
            steps {
                sh '''
                    docker run --rm \
                        -v "$PWD/frontend":/src \
                        -w /src \
                        -e CI=true \
                        node:20-alpine \
                        sh -c "
                            npm ci &&
                            # assumes jest-junit or vitest-junit writes junit.xml
                            npm test -- --ci --runInBand
                        "
                '''
            }
            post {
                always {
                    junit allowEmptyResults: true,
                          testResults: 'frontend/junit.xml'
                }
            }
        }
    }

    /* ─────────────
       Housekeeping
       ───────────── */
    post {
        success { echo '🎉  Build completed (tests will auto-run once you add them).' }
        failure { echo '💥  Build failed – check the console log.' }
    }
}
