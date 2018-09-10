variable "s3"  {type="map"}

# --------------------------------------------------
# Client Website Bucket
# --------------------------------------------------

resource "aws_s3_bucket" "client_site" {
    bucket = "${var.s3["bucket_name"]}"
    acl = "public-read"
    policy = "${data.template_file.s3_bucket_policy.rendered}"

    website {
      index_document = "index.html"
      error_document = "404.html"
    }
    tags {
      name = "${var.s3["bucket_name"]} client site"
    }
    force_destroy = true
}

data "template_file" "s3_bucket_policy" {
  template = "${file("${path.module}/s3-website-policy.json")}"

  vars {
    bucket_name = "${var.s3["bucket_name"]}"
  }
}
