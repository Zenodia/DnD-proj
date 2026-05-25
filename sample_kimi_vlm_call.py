
import requests, base64

import os
nv_api_key=os.environ["NVIDIA_API_KEY"] 
invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
stream = True

def read_b64(path):
  with open(path, "rb") as f:
    return base64.b64encode(f.read()).decode()
image_b64s = [read_b64(f"image.png") for i in range(1, 2)]

headers = {
  "Authorization": f"Bearer {nv_api_key}",
  "Accept": "text/event-stream" if stream else "application/json"
}

payload = {
  "model": "moonshotai/kimi-k2.6",
  "messages": [
      {
        "role": "user",
        "content": [{"type":"image_url","image_url":{"url":f"data:image/png;base64,{image_b64s[0]}"}},{"type":"text","text":"Describe the image."}]
      }
    ],
  "max_tokens": 16384,
  "temperature": 1.00,
  "top_p": 1.00,
  "stream": stream,
  "chat_template_kwargs": {"thinking":True},
}
payload["tools"] = [{"type":"function","function":{"name":"describe_harry_potter_character","description":"Returns information and images of Harry Potter characters.","parameters":{"type":"object","properties":{"name":{"type":"string","enum":["Harry James Potter","Hermione Jean Granger","Ron Weasley","Fred Weasley","George Weasley","Bill Weasley","Percy Weasley","Charlie Weasley","Ginny Weasley","Molly Weasley","Arthur Weasley","Neville Longbottom","Luna Lovegood","Draco Malfoy","Albus Percival Wulfric Brian Dumbledore","Minerva McGonagall","Remus Lupin","Rubeus Hagrid","Sirius Black","Severus Snape","Bellatrix Lestrange","Lord Voldemort","Cedric Diggory","Nymphadora Tonks","James Potter"],"description":"Name of the Harry Potter character"}},"required":["name"]}}}]
payload["tool_choice"] = "auto"

response = requests.post(invoke_url, headers=headers, json=payload, stream=stream)
if stream:
    for line in response.iter_lines():
        if line:
            print(line.decode("utf-8"))
else:
    print(response.json())
