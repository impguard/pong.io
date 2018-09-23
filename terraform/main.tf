# Configure the AWS Provider
provider "aws" {
  region = "${var.region}"
  profile = "${var.aws_profile}"
}

terraform {
  backend "s3" {
    bucket  = "cfortuner-terraform"
    key     = "pong.io/terraform.tfstate"
    region  = "us-west-2"
    profile = "colin-aws"
  }
}

# ----------------------------------------
# VPCs
# ----------------------------------------

# Default
resource "aws_vpc" "pong_vpc" {
  cidr_block = "${var.vpc_cidr}"
  enable_dns_hostnames = true

  tags {
    Name = "pong-vpc"
  }
}

# ----------------------------------------
# Subnets
# ----------------------------------------

resource "aws_subnet" "public-subnet" {
  vpc_id = "${aws_vpc.pong_vpc.id}"
  cidr_block = "${var.public_subnet_cidr}"
  availability_zone = "us-west-2a"

  tags {
    Name = "public"
  }
}

resource "aws_subnet" "private-subnet" {
  vpc_id = "${aws_vpc.pong_vpc.id}"
  cidr_block = "${var.private_subnet_cidr}"
  availability_zone = "us-west-2b"

  tags {
    Name = "private"
  }
}

# ----------------------------------------
# Internet gateway
# ----------------------------------------

# Define the internet gateway
resource "aws_internet_gateway" "gateway" {
  vpc_id = "${aws_vpc.pong_vpc.id}"

  tags {
    Name = "internet_gateway"
  }
}

# ----------------------------------------
# Route table
# ----------------------------------------

# Define the route table
resource "aws_route_table" "public-route_table" {
  vpc_id = "${aws_vpc.pong_vpc.id}"

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = "${aws_internet_gateway.gateway.id}"
  }

  tags {
    Name = "public-route_table"
  }
}

# Assign the route table to the public Subnet
resource "aws_route_table_association" "public-route_table" {
  subnet_id = "${aws_subnet.public-subnet.id}"
  route_table_id = "${aws_route_table.public-route_table.id}"
}

# ----------------------------------------
# Security Groups
# ----------------------------------------

# Define the security group for public subnet
resource "aws_security_group" "public-security_group" {
  name = "pong-public-security_group"
  description = "Allow incoming HTTP connections & SSH access"

  ingress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks =  ["0.0.0.0/0"]
  }

  egress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    cidr_blocks     = ["0.0.0.0/0"]
  }

  vpc_id="${aws_vpc.pong_vpc.id}"

  tags {
    Name = "pong-public-subnet-security_group"
  }
}
