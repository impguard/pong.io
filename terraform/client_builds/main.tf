variable "s3"  {type="map"}
# --------------------------------------------------
# Client Builds Storage
# --------------------------------------------------

resource "aws_s3_bucket" "client_builds_bucket" {
  bucket = "${var.s3["project_id"]}-client-builds-${var.s3["build_type"]}"
  acl    = "private"

  tags {
    Name        = "${var.s3["project_id"]} client builds"
    Build_Type  = "${var.s3["build_type"]}"
  }
}
