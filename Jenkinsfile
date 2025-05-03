pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Test Backend') {
            steps {
                dir('backend') {
                    sh 'pip3 install -r requirements.txt --user'
                    // Export the environment variable and run tests
                    sh 'export SKIP_DB_INIT=1 && python3 -m pytest --maxfail=1 --disable-warnings -q tests/'
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