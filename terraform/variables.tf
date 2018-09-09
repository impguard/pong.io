variable "region" {
    default = "us-west-2"
}

variable "aws_profile" {
    default = "colin-aws"
}

variable "account_id" {
    default = 344778228378
}

variable "project_id" {
  default= "pong"
}

variable "vpc_cidr" {
  description = "CIDR for the Default VPC"
  default = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR for the public subnet"
  default = "10.0.1.0/24"
}

variable "private_subnet_cidr" {
  description = "CIDR for the private subnet"
  default = "10.0.2.0/24"
}

variable "default_public_security_group" {
  default = "sg-0594212d7e9578f9d"
}

variable "public_subnet" {
  default = "subnet-0df5a175ba320792a"
}
