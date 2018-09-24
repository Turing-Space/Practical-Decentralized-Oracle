import csv
import glob
import matplotlib.pyplot as plt

def getAve(arr):
    return sum([int(x) for x in arr]) / len(arr)

ans = []

list_of_files = sorted(glob.glob('./Exp3*.csv'))
for file_name in list_of_files:
    with open(file_name, newline='') as csvfile:
        spamreader = csv.reader(csvfile, delimiter=',')
        for row in spamreader:
            print(row)
            # res = getAve(row[1:])
            res = getAve(row)
            
            print(res)
            ans.append(res)

plt.plot(ans)
plt.show()
