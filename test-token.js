const jwt = require('jsonwebtoken');

// Test token generation exactly as your code does it
const playbackId = 'tKRSmXUmgpYKdkhpEcR4QWM9BIUP3xwH5DIHSluByQs';
const signingKeyId = 'WGUd01tyW001TO9zzC6t7JHM19ioGQot02DRG02FRp6cfoo';

// Your base64 key
const signingKeyBase64 = process.env.MUX_SIGNING_KEY_BASE64 || 'LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFcEFJQkFBS0NBUUVBcWNaWFJtem9PZk41amoxcFZMSXRoZDhDMElHbWMvVUVZdmNhdEQwQzRjeXBURU8rClU3emZ6M2pkcUhOenVGUzZxZlN4YUZsRXlUTytMWW8rc3RkT2RyNXRXSVdQQUZNeDJBa1RtMENmRVhDMGNLWmEKOStwRlMzRUt4bDkyTno0d0NCbGVmWCsxaER2QVNSdkNja1ZsclVtZVczSEp2RlFZWUFLdzVNUGovR2RteDRIRApmWDA5amxhSXVqOUkySHd1blRaZEJHWTBhbzNscUJqVVRqVURQYVd3OHM3NXRza0xSMnFBazNvTnlkMTFVaysrCi9tSFlySmtIdHUyUE1mV3plc3A0Zkl1ajJMUmMwZFNCeWtzNmV5c0NZcng4TlVVMFJPcjl4Wmk3OWFCelFqT1kKSTRSODJpa0hSSThiOTk1NDVnN0U0Sjd1emJaY2JCbi9vNEtoRHdJREFRQUJBb0lCQUF1RVppRVhDT0RMSlh2OApSRld4UTN4UzdWelo3U2hVQzd3SStaTkovSzVkVlF3SHVhZ2xtYkdyaUVoYmVLeTNFRnZqMUZmNDlZbnVzcE5pCkc4bkQ2R3RCKzBCbmxrZkpkcU4zR3ZkTHhYaFZISDFhclU0bkw2MmtBQW5UUTNDcWpXOEEwbUI0aVZPR1BvK2oKNWZSUDkrVHZEa2tBYWFIS0lYbVY2NHhhK0crM0FDVTN5eFdjMzBiODlJcHJzSFZubXRPa3YxYlpTSGJlK01YbAp2SlJNejJtT3E3QWlCU2hNcHZBU1BIV09MMnNTM0VES3RwUHJoVC9Oc0pBOFdld3VJeXgya25wNHVNM1pvZDdzCjlwL2V2dmNEaFdTMzRrUVNpSWVpRFpqeXViMTZlU3JYRzJBeTdkWWJlY3d2RWJ0VWVqUjRtTCt3Q1hzNEtCT0oKUk1yeElJa0NnWUVBekFIVWw0QTNOekptcEw4bVl0TjFMQ0lVMzBnbnVrU2g1ZGhOS24ybjEveWlHL3VqbmF2ZwovMWVITlJ6b2hmYzJBVE1tNXVaSTdtUStQcVhsd1JqZlVScjhNWWdkSzN6dE1JZjJWUDV6NWd1Z0Z1M0M3UndVCmdnZ3VmK3RJdFFkTEd6d2N2QWZMbmhINW80VkpBZmhZVTgwUElSWThQZWt6Skt4QzJoL3FRN2NDZ1lFQTFRc1EKdE5xR204RjAzZVZhVnphR3Q1T2ZIMmYzamI3aVZDL25XQXdkTGI1TFZNWWFvSVJZTWYyNGFZK3h2NnhWeU9QQgpTVU1mUHI4OWUvbTFrMnBOWEJHdXk0L0pFZGt4Z3owTjJXcTFqblR3VmtZQVh5b2taQm9CRy90bk5iME1oTEhICnpNcVhEUUdLZm9aVDkxaUp4VUJFMG9rcythNzNOeGxnWWo2SC9Xa0NnWUVBdXNWeVBNSEZ5Mkw1VmhzcXFZK3UKMXBqZFF3NXNVTHhFL0lqckhOdXRyckE4T2lKSHlUSnk2MUxYRm1sQStHVTdyQjJJb0J4MDZNd2RzSDF4dXpkcQpQSGJZTFFEUXM5L0x4NEt5bzEzUi9lcm14aGNuUHExV21UV2tYTGlyK0JDVlVubldWTTlPTzRsNVk1dkRHMnFpCmN4WnBvNEVYNWhaNkhEa1plMWw4d0VFQ2dZRUF2bHM2dkQ0ZDFJSVJLRXZNWXV6bmhwUXlzOTh6eE1Wd2VZU3MKRTNJUGlGWGwvWU5kTzF2RmFqV29Wem43dXFZRHFKSkluR3VMT1llckttRStxczlxKy84WXplNVYzTXJTZ005RwoxcU9RUWcrZXg1ZVlzVzk0UUxFem1Jc1Q5MkpLRXk2K3RlKzI4L29TZzJjSEU1VmExSkxPYThnQ0ZiOE9TWDgxCkxkTnRzekVDZ1lCRmlhcWFaY3AyMW5DamtQK0xDTm9McGhIQTh6cVgwU2JEeXpycEQ0L0xWVUNFb3NJZVZWbHYKWEVtMytpV045SlRJQll4ZWFXT1BuaGVFTmxmc05jeXBsVzNxbzFRRmNOeWlUQkdISXR5V05MYUtuTXJ6dFlCcwo3OGMvWFVvRi9TU051MmtncTRnU3JuQ21PVGJuVXNVQWpQUForazJBMi8xd25naEFuaW9pTWc9PQotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQo=';

// Decode the key
const signingKey = Buffer.from(signingKeyBase64, 'base64').toString('utf8');

console.log('Key decoded successfully:', signingKey.substring(0, 50) + '...');

// Generate token exactly as Mux expects
const now = Math.floor(Date.now() / 1000);
const payload = {
  sub: playbackId,
  aud: 'v',  // Mux expects 'v' for video
  exp: now + 3600,
  viewer_id: 'test-user'
};

try {
  const token = jwt.sign(payload, signingKey, {
    algorithm: 'RS256',
    noTimestamp: true,
    keyid: signingKeyId  // This puts 'kid' in the header
  });

  console.log('\nToken generated successfully!');
  console.log('Token length:', token.length);
  console.log('Token preview:', token.substring(0, 100) + '...');
  
  // Decode to verify structure
  const decoded = jwt.decode(token, { complete: true });
  console.log('\nDecoded token:');
  console.log('Header:', JSON.stringify(decoded.header, null, 2));
  console.log('Payload:', JSON.stringify(decoded.payload, null, 2));
  
  // Test URL
  const testUrl = `https://stream.mux.com/${playbackId}.m3u8?token=${token}`;
  console.log('\nTest URL:', testUrl);
  
} catch (error) {
  console.error('Error generating token:', error.message);
}