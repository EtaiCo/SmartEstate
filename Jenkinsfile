pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Backend') {
            steps {
                dir('backend') {
                    sh 'pip3 install -r requirements.txt'
                }
            }
        }

        stage('Test Backend') {
            steps {
                dir('backend') {
                    sh 'python3 -m pytest --maxfail=1 --disable-warnings -q'
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check the logs for details.'
        }
    }
}