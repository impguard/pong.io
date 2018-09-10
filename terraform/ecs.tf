# --------------------------------------------------
# ECR
# --------------------------------------------------

resource "aws_ecr_repository" "ecr_repository" {
  name = "${var.project_id}"
}

resource "aws_ecr_lifecycle_policy" "expiration" {
  repository = "${aws_ecr_repository.ecr_repository.name}"

  policy = <<EOF
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Expire all untagged images",
      "selection": {
        "tagStatus": "untagged",
        "countType": "imageCountMoreThan",
        "countNumber": 1
      },
      "action": {
        "type": "expire"
      }
    },
    {
      "rulePriority": 2,
      "description": "Expire oldest images",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 5
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
EOF
}

# --------------------------------------------------
# Cluster
# --------------------------------------------------

resource "aws_ecs_cluster" "sandbox" {
  name = "pong-sandbox"
}

# --------------------------------------------------
# Task Role
# --------------------------------------------------

resource "aws_iam_role" "task" {
  name = "pong-task_role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}


data "aws_iam_policy" "task_execution" {
  arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy_attachment" "task_execution" {
    role       = "${aws_iam_role.task.name}"
    policy_arn = "${data.aws_iam_policy.task_execution.arn}"
}

# --------------------------------------------------
# Cloudwatch Group
# --------------------------------------------------

resource "aws_cloudwatch_log_group" "sandbox" {
  name = "pong-sandbox"
}
