/* Jenkinsfile – no-tests edition
 * Requires: Declarative Pipeline + Docker plugin (for dockerContainer agent)
 * Optional: Workspace Cleanup plugin if you keep the cleanWs() step
 */
pipeline {
    agent none                          // each stage chooses its own container
    options { timestamps() }            // timestamps is built-in

    stages {

        /* -------- Python backend build -------- */
        stage('Backend – Build') {
            agent {
                dockerContainer {
                    image 'python:3.12-alpine'   // modern, maintained tag
                    args  '-u root:root'         // avoid UID mismatch issues
                    reuseNode true
                }
            }
            steps {
                checkout scm                    // clone once per stage
                dir('backend') {
                    sh '''
                        python -m pip install --upgrade pip
                        # compile all .py files; ignore “no tests” errors
                        python -m py_compile $(find . -name '*.py')
                    '''
                }
            }
        }

        /* -------- React frontend build -------- */
        stage('Frontend – Build') {
            agent {
                dockerContainer {
                    image 'node:20-alpine'
                    args  '-u node'              // run as non-root
                    reuseNode true
                }
            }
            environment { CI = 'true' }          // keeps CRA/Vite quiet
            steps {
                checkout scm
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: 'frontend/build/**', fingerprint: true
                }
            }
        }
    }

    post {
        cleanup { cleanWs() }   // remove if you don’t have the Workspace Cleanup plugin
    }
}
