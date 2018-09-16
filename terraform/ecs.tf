# --------------------------------------------------
# ECR
# --------------------------------------------------

resource "aws_ecr_repository" "pong" {
  name = "${var.project_id}"
}

resource "aws_ecr_lifecycle_policy" "expiration" {
  repository = "${aws_ecr_repository.pong.name}"

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
# Spot Instances IAM Roles
# --------------------------------------------------

resource "aws_iam_role" "ecs-fleet" {
  name = "pong-fleet_role"

  assume_role_policy = <<EOF
{
  "Version": "2008-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "spotfleet.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "spot-fleet-tagging"  {
  role = "${aws_iam_role.ecs-fleet.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2SpotFleetTaggingRole"
}

resource "aws_iam_role" "ecs-instance" {
  name = "pong-instance_role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "ecs-ec2" {
  role       = "${aws_iam_role.ecs-instance.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "ecs" {
  name = "pong-ecs_instance_profile"
  role = "${aws_iam_role.ecs-instance.name}"
}

# --------------------------------------------------
# Spot Fleet Request
# --------------------------------------------------

resource "aws_spot_fleet_request" "sandbox" {
  iam_fleet_role      = "${aws_iam_role.ecs-fleet.arn}"
  target_capacity     = "1"
  valid_until         = "2018-09-30T00:00:00Z"

  wait_for_fulfillment = true
  timeouts {
    create = "1m"
  }

  launch_specification {
    instance_type            = "t2.micro"
    ami                      = "ami-093381d21a4fc38d1"
    iam_instance_profile_arn = "${aws_iam_instance_profile.ecs.arn}"
    key_name                 = "pong-ecs"
    availability_zone        = "${aws_subnet.public-subnet.availability_zone}"
    subnet_id                = "${aws_subnet.public-subnet.id}"
    vpc_security_group_ids   = ["${aws_security_group.public-security_group.id}"]
    associate_public_ip_address = true

    root_block_device {
      volume_size = "10"
      volume_type = "gp2"
    }

    ebs_block_device {
      device_name = "/dev/xvdcz"
      volume_size = "50"
      volume_type = "gp2"
    }

    user_data = <<EOF
#!/bin/bash
echo ECS_CLUSTER=${aws_ecs_cluster.sandbox.name} >> /etc/ecs/ecs.config
EOF

    tags {
      Name = "pong-sandbox-fleet-ecs"
    }
  }
}

# --------------------------------------------------
# Cloudwatch Group
# --------------------------------------------------

resource "aws_cloudwatch_log_group" "sandbox" {
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
