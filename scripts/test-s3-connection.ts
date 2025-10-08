import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3"
import dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.local" })

async function testS3Connection() {
  console.log("Testing S3 connection...")
  console.log("=====================================")
  
  // Check if environment variables are set
  const requiredVars = ["AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "S3_BUCKET_NAME"]
  const missingVars = requiredVars.filter(v => !process.env[v])
  
  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables:")
    missingVars.forEach(v => console.error(`   - ${v}`))
    console.log("\nPlease add these to your .env.local file")
    process.exit(1)
  }
  
  console.log("✓ Environment variables configured")
  console.log(`  Region: ${process.env.AWS_REGION}`)
  console.log(`  Bucket: ${process.env.S3_BUCKET_NAME}`)
  console.log(`  Access Key: ${process.env.AWS_ACCESS_KEY_ID?.substring(0, 10)}...`)
  
  try {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
    
    console.log("\nTesting bucket access...")
    
    // Try to list objects in the bucket
    const command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME!,
      MaxKeys: 5,
      Prefix: "videos/",
    })
    
    const response = await s3Client.send(command)
    
    console.log("✓ Successfully connected to S3!")
    console.log(`  Objects in bucket: ${response.KeyCount || 0}`)
    
    if (response.Contents && response.Contents.length > 0) {
      console.log("\nExisting videos in S3:")
      response.Contents.forEach(obj => {
        console.log(`  - ${obj.Key} (${Math.round((obj.Size || 0) / 1024 / 1024)}MB)`)
      })
    }
    
    console.log("\n✅ S3 configuration is valid and working!")
    console.log("You can now run: npm run migrate:videos")
    
  } catch (error: any) {
    console.error("\n❌ S3 connection failed!")
    console.error(`Error: ${error.message}`)
    
    if (error.name === "NoSuchBucket") {
      console.error("\nThe specified bucket does not exist. Please create it first.")
    } else if (error.name === "AccessDenied") {
      console.error("\nAccess denied. Please check your IAM permissions.")
    } else if (error.name === "InvalidAccessKeyId") {
      console.error("\nInvalid Access Key ID. Please check your credentials.")
    } else if (error.name === "SignatureDoesNotMatch") {
      console.error("\nInvalid Secret Access Key. Please check your credentials.")
    }
    
    process.exit(1)
  }
}

// Run test
testS3Connection().catch(console.error)